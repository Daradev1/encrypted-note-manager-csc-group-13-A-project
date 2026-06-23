// src/main.rs

// Import everything we need
use axum::{
    extract::Path,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, put, delete},
    Json, Router,
};
use mongodb::{
    bson::{doc, oid::ObjectId, DateTime},
    options::ClientOptions,
    Client, Collection,
};
use serde::{Deserialize, Serialize};
use std::env;
use tower_http::cors::{Any, CorsLayer};
use futures::stream::TryStreamExt;

// Import encryption module
mod encryption;
use encryption::Encryption;

// === MODEL: Note structure in MongoDB ===
#[derive(Debug, Serialize, Deserialize, Clone)]
struct Note {
    #[serde(rename = "_id")]
    id: ObjectId,
    user_id: String,
    title_ciphertext: String,  // Encrypted title
    title_iv: String,           // IV for title
    content_ciphertext: String, // Encrypted content
    content_iv: String,         // IV for content
    pinned: bool,
    starred: bool,
    created_at: DateTime,
    updated_at: DateTime,
}

// === DTOs: Request/Response structures ===

// Create note request (what frontend sends)
#[derive(Debug, Deserialize)]
struct CreateNoteRequest {
    user_id: String,  // Add this!
    title: String,
    content: String,
}

// Update note request
#[derive(Debug, Deserialize)]
struct UpdateNoteRequest {
    title: Option<String>,
    content: Option<String>,
    pinned: Option<bool>,
    starred: Option<bool>,
}

// Note response (what frontend receives - DECRYPTED)
#[derive(Debug, Serialize)]
struct NoteResponse {
    id: String,
    title: String,      // Decrypted
    content: String,    // Decrypted
    pinned: bool,
    starred: bool,
    created_at: String,
    updated_at: String,
}

// === Helper: Convert Note to NoteResponse (with decryption) ===
impl From<Note> for NoteResponse {
    fn from(note: Note) -> Self {
        // Decrypt title
        let title = Encryption::decrypt(&note.title_ciphertext, &note.title_iv)
            .unwrap_or_else(|_| "[Encrypted]".to_string());
        
        // Decrypt content
        let content = Encryption::decrypt(&note.content_ciphertext, &note.content_iv)
            .unwrap_or_else(|_| "[Encrypted content]".to_string());
        
        Self {
            id: note.id.to_hex(),
            title,
            content,
            pinned: note.pinned,
            starred: note.starred,
            created_at: note.created_at.to_string(),
            updated_at: note.updated_at.to_string(),
        }
    }
}

// === Application State ===
#[derive(Clone)]
struct AppState {
    db: Collection<Note>,
}

// === API HANDLERS ===

// GET /api/notes/:user_id - Get all notes for a specific user
async fn get_notes(
    Path(user_id): Path<String>,
    state: axum::extract::State<AppState>,
) -> impl IntoResponse {
    println!("📖 Getting notes for user: {}", user_id);
    
    let filter = doc! { "user_id": &user_id };
    let cursor = state.db.find(filter, None).await;
    
    match cursor {
        Ok(cursor) => {
            let notes: Vec<Note> = cursor.try_collect().await.unwrap_or_else(|_| vec![]);
            println!("✅ Found {} notes for user", notes.len());
            
            let response: Vec<NoteResponse> = notes.into_iter().map(NoteResponse::from).collect();
            (StatusCode::OK, Json(response))
        }
        Err(e) => {
            println!("❌ Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(Vec::<NoteResponse>::new()))
        }
    }
}

// GET /api/note/:id - Get a single note by ID
async fn get_note(
    Path(id): Path<String>,
    state: axum::extract::State<AppState>,
) -> impl IntoResponse {
    println!("📖 Getting note with id: {}", id);
    
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => {
            return (StatusCode::BAD_REQUEST, Json(None::<NoteResponse>));
        }
    };
    
    let filter = doc! { "_id": object_id };
    let note = state.db.find_one(filter, None).await;
    
    match note {
        Ok(Some(note)) => {
            println!("✅ Found note");
            (StatusCode::OK, Json(Some(NoteResponse::from(note))))
        }
        Ok(None) => {
            println!("❌ Note not found");
            (StatusCode::NOT_FOUND, Json(None))
        }
        Err(e) => {
            println!("❌ Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(None))
        }
    }
}

// POST /api/notes - Create a new note (with encryption!)
async fn create_note(
    state: axum::extract::State<AppState>,
    Json(payload): Json<CreateNoteRequest>,
) -> impl IntoResponse {
    println!("📝 Creating new note for user: {}", payload.user_id);
    println!("   Title: {}", payload.title);
    
    // Encrypt title
    let (title_ciphertext, title_iv) = match Encryption::encrypt(&payload.title) {
        Ok(result) => result,
        Err(e) => {
            println!("❌ Title encryption failed: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(None::<NoteResponse>));
        }
    };
    
    // Encrypt content
    let (content_ciphertext, content_iv) = match Encryption::encrypt(&payload.content) {
        Ok(result) => result,
        Err(e) => {
            println!("❌ Content encryption failed: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(None::<NoteResponse>));
        }
    };
    
    let new_note = Note {
        id: ObjectId::new(),
        user_id: payload.user_id,
        title_ciphertext,
        title_iv,
        content_ciphertext,
        content_iv,
        pinned: false,
        starred: false,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
    };
    
    match state.db.insert_one(&new_note, None).await {
        Ok(_) => {
            println!("✅ Note created with id: {}", new_note.id);
            (StatusCode::CREATED, Json(Some(NoteResponse::from(new_note))))
        }
        Err(e) => {
            println!("❌ Failed to create note: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(None))
        }
    }
}

// PUT /api/notes/:id - Update a note
async fn update_note(
    Path(id): Path<String>,
    state: axum::extract::State<AppState>,
    Json(payload): Json<UpdateNoteRequest>,
) -> impl IntoResponse {
    println!("📝 Updating note: {}", id);
    
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => return StatusCode::BAD_REQUEST,
    };
    
    // First, get the existing note to preserve encrypted fields
    let filter = doc! { "_id": object_id };
    let existing = state.db.find_one(filter.clone(), None).await;
    
    let mut update_doc = doc! {};
    
    match existing {
        Ok(Some(_existing_note)) => {
            // Handle title update
            if let Some(title) = payload.title {
                let (ciphertext, iv) = match Encryption::encrypt(&title) {
                    Ok((c, i)) => (c, i),
                    Err(e) => {
                        println!("❌ Title encryption failed: {}", e);
                        return StatusCode::INTERNAL_SERVER_ERROR;
                    }
                };
                update_doc.insert("title_ciphertext", ciphertext);
                update_doc.insert("title_iv", iv);
            }
            
            // Handle content update
            if let Some(content) = payload.content {
                let (ciphertext, iv) = match Encryption::encrypt(&content) {
                    Ok((c, i)) => (c, i),
                    Err(e) => {
                        println!("❌ Content encryption failed: {}", e);
                        return StatusCode::INTERNAL_SERVER_ERROR;
                    }
                };
                update_doc.insert("content_ciphertext", ciphertext);
                update_doc.insert("content_iv", iv);
            }
            
            // Handle pin/star updates
            if let Some(pinned) = payload.pinned {
                update_doc.insert("pinned", pinned);
            }
            if let Some(starred) = payload.starred {
                update_doc.insert("starred", starred);
            }
            
            update_doc.insert("updated_at", DateTime::now());
            
            let update = doc! { "$set": update_doc };
            
            match state.db.update_one(filter, update, None).await {
                Ok(result) => {
                    if result.matched_count == 0 {
                        println!("❌ Note not found");
                        StatusCode::NOT_FOUND
                    } else {
                        println!("✅ Note updated successfully");
                        StatusCode::OK
                    }
                }
                Err(e) => {
                    println!("❌ Update failed: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                }
            }
        }
        _ => {
            println!("❌ Note not found");
            StatusCode::NOT_FOUND
        }
    }
}

// DELETE /api/notes/:id - Delete a note
async fn delete_note(
    Path(id): Path<String>,
    state: axum::extract::State<AppState>,
) -> impl IntoResponse {
    println!("🗑️ Deleting note: {}", id);
    
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => return StatusCode::BAD_REQUEST,
    };
    
    let filter = doc! { "_id": object_id };
    
    match state.db.delete_one(filter, None).await {
        Ok(result) => {
            if result.deleted_count == 0 {
                println!("❌ Note not found");
                StatusCode::NOT_FOUND
            } else {
                println!("✅ Note deleted successfully");
                StatusCode::OK
            }
        }
        Err(e) => {
            println!("❌ Delete failed: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

// === MAIN FUNCTION ===
#[tokio::main]
async fn main() {
    println!("🚀 Starting encrypted notes backend...");
    
    // Load .env file
    dotenvy::dotenv().ok();
    
    let mongodb_uri = env::var("MONGODB_URI")
        .expect("❌  must be set in .env file");
    
    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string());
    
    println!("📦 Connecting to MongoDB...");
    
    // Connect to MongoDB
    let client_options = ClientOptions::parse(&mongodb_uri).await.unwrap();
    let client = Client::with_options(client_options).unwrap();
    let db = client.database("notes-app");
    let collection: Collection<Note> = db.collection("notes");
    
    println!("✅ Connected to MongoDB successfully!");
    
    let state = AppState { db: collection };
    
    // Setup CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    // Build router - IMPORTANT: Order matters!
    let app = Router::new()
        .route("/api/notes/:user_id", get(get_notes))  // GET notes for user
        .route("/api/notes", post(create_note))        // POST new note
        .route("/api/notes/id/:id", get(get_note))     // GET single note by ID
        .route("/api/notes/id/:id", put(update_note))  // PUT update note
        .route("/api/notes/id/:id", delete(delete_note)) // DELETE note
        .layer(cors)
        .with_state(state);
    
    // Start server
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await.unwrap();
    
    println!("🌟 Server running on http://0.0.0.0:{}", port);
    println!("📝 API endpoints:");
    println!("   GET    /api/notes/:user_id  - Get all notes for a user");
    println!("   POST   /api/notes           - Create new note");
    println!("   GET    /api/notes/id/:id    - Get single note");
    println!("   PUT    /api/notes/id/:id    - Update note");
    println!("   DELETE /api/notes/id/:id    - Delete note");
    println!("🔐 Encryption: AES-256-GCM enabled");
    
    axum::serve(listener, app).await.unwrap();
}