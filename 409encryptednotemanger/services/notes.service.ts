// src/services/notes.service.ts
import { apiService } from "./api.service";
import { Note } from "@/store/useNotesStore";

// This matches EXACTLY what your Rust backend expects
export interface CreateNoteDto {
  user_id: string;
  title: string;
  content: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  pinned?: boolean;
  starred?: boolean;
}

// This matches EXACTLY what your Rust backend returns
export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  starred: boolean;
  created_at: string;
  updated_at: string;
}

class NotesService {
  private readonly endpoint = "/notes";

  // Helper to safely parse dates
  private safeParseDate(dateString: string): Date {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date(); // fallback to current date
      }
      return date;
    } catch {
      return new Date(); // fallback to current date
    }
  }

  // Helper to convert NoteResponse to Note
  private convertToNote(item: NoteResponse): Note {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      preview:
        item.content.substring(0, 100) +
        (item.content.length > 100 ? "..." : ""),
      createdAt: this.safeParseDate(item.created_at),
      updatedAt: this.safeParseDate(item.updated_at),
      pinned: item.pinned,
      starred: item.starred,
      encrypted: false,
      color: this.getRandomColor(),
      synced: true, // Mark as synced when coming from backend
    };
  }

  // Get all notes for a specific user
  async getAllNotes(userId: string): Promise<Note[]> {
    try {
      const response = await apiService.get<NoteResponse[]>(
        `${this.endpoint}/${userId}`,
      );

      if (response.error) {
        console.error("Failed to fetch notes:", response.error);
        return [];
      }

      return (response.data || []).map((item) => this.convertToNote(item));
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
  }

  // Get single note by ID
  async getNoteById(id: string): Promise<Note | null> {
    try {
      const response = await apiService.get<NoteResponse>(
        `${this.endpoint}/id/${id}`,
      );

      if (response.error || !response.data) {
        return null;
      }

      return this.convertToNote(response.data);
    } catch (error) {
      console.error("Error fetching note by id:", error);
      return null;
    }
  }

  // Get single note by ID (alias for backward compatibility)
  async getNote(id: string): Promise<Note | null> {
    return this.getNoteById(id);
  }

  // Create note - matches your Rust POST endpoint
  async createNote(noteData: CreateNoteDto): Promise<Note | null> {
    try {
      const response = await apiService.post<NoteResponse>(this.endpoint, {
        user_id: noteData.user_id,
        title: noteData.title,
        content: noteData.content,
      });

      if (response.error || !response.data) {
        return null;
      }

      return this.convertToNote(response.data);
    } catch (error) {
      console.error("Error creating note:", error);
      return null;
    }
  }

  // Update note - matches your Rust PUT endpoint
  async updateNote(id: string, updates: UpdateNoteDto): Promise<Note | null> {
    try {
      const response = await apiService.put<NoteResponse>(
        `${this.endpoint}/id/${id}`,
        updates,
      );

      if (response.error || !response.data) {
        return null;
      }

      return this.convertToNote(response.data);
    } catch (error) {
      console.error("Error updating note:", error);
      return null;
    }
  }

  // Delete note - matches your Rust DELETE endpoint
  async deleteNote(id: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`${this.endpoint}/id/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  }

  // Batch sync notes - optional optimization for syncing multiple notes at once
  async syncNotes(notes: Partial<Note>[]): Promise<Note[]> {
    try {
      // This is a helper method - you might want to implement a batch endpoint in your Rust backend
      // For now, we'll sync one by one
      const syncedNotes: Note[] = [];

      for (const note of notes) {
        if (note.id) {
          const updated = await this.updateNote(note.id, {
            title: note.title,
            content: note.content,
            pinned: note.pinned,
            starred: note.starred,
          });
          if (updated) {
            syncedNotes.push(updated);
          }
        }
      }

      return syncedNotes;
    } catch (error) {
      console.error("Error syncing notes:", error);
      return [];
    }
  }

  private getRandomColor(): string {
    const colors = [
      "from-purple-500/20 to-pink-500/20",
      "from-blue-500/20 to-cyan-500/20",
      "from-green-500/20 to-emerald-500/20",
      "from-orange-500/20 to-red-500/20",
      "from-indigo-500/20 to-purple-500/20",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const notesService = new NotesService();
