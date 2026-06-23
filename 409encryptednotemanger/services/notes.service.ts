// src/services/notes.service.ts
import { apiService } from './api.service'
import { Note } from '@/store/useNotesStore'

// This matches EXACTLY what your Rust backend expects
export interface CreateNoteDto {
  user_id: string
  title: string
  content: string
}

export interface UpdateNoteDto {
  title?: string
  content?: string
  pinned?: boolean
  starred?: boolean
}

// This matches EXACTLY what your Rust backend returns
export interface NoteResponse {
  id: string
  title: string
  content: string
  pinned: boolean
  starred: boolean
  created_at: string
  updated_at: string
}

class NotesService {
  private readonly endpoint = '/notes'

  // Helper to safely parse dates
  private safeParseDate(dateString: string): Date {
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date() // fallback to current date
      }
      return date
    } catch {
      return new Date() // fallback to current date
    }
  }

  // Get all notes for a specific user
  // FIXED: Using /notes/:user_id as per Rust backend
  async getAllNotes(userId: string): Promise<Note[]> {
    try {
      const response = await apiService.get<NoteResponse[]>(`${this.endpoint}/${userId}`)
      
      if (response.error) {
        console.error('Failed to fetch notes:', response.error)
        return []
      }

      return (response.data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        preview: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        createdAt: this.safeParseDate(item.created_at),
        updatedAt: this.safeParseDate(item.updated_at),
        pinned: item.pinned,
        starred: item.starred,
        encrypted: false,
        color: this.getRandomColor(),
      }))
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
    }
  }

  // Get single note by ID
  // FIXED: Using /notes/id/:id as per Rust backend
  async getNote(id: string): Promise<Note | null> {
    try {
      const response = await apiService.get<NoteResponse>(`${this.endpoint}/id/${id}`)
      
      if (response.error || !response.data) {
        return null
      }

      const item = response.data
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        preview: item.content.substring(0, 100),
        createdAt: this.safeParseDate(item.created_at),
        updatedAt: this.safeParseDate(item.updated_at),
        pinned: item.pinned,
        starred: item.starred,
        encrypted: false,
        color: this.getRandomColor(),
      }
    } catch (error) {
      console.error('Error fetching note:', error)
      return null
    }
  }

  // Create note - matches your Rust POST endpoint
  // This is CORRECT - POST to /notes
  async createNote(noteData: CreateNoteDto): Promise<Note | null> {
    try {
      const response = await apiService.post<NoteResponse>(this.endpoint, {
        user_id: noteData.user_id,
        title: noteData.title,
        content: noteData.content,
      })

      if (response.error || !response.data) {
        return null
      }

      const item = response.data
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        preview: item.content.substring(0, 100),
        createdAt: this.safeParseDate(item.created_at),
        updatedAt: this.safeParseDate(item.updated_at),
        pinned: item.pinned,
        starred: item.starred,
        encrypted: false,
        color: this.getRandomColor(),
      }
    } catch (error) {
      console.error('Error creating note:', error)
      return null
    }
  }

  // Update note - matches your Rust PUT endpoint
  // FIXED: Using /notes/id/:id as per Rust backend
  async updateNote(id: string, updates: UpdateNoteDto): Promise<Note | null> {
    try {
      const response = await apiService.put<NoteResponse>(
        `${this.endpoint}/id/${id}`,
        updates
      )

      if (response.error || !response.data) {
        return null
      }

      const item = response.data
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        preview: item.content.substring(0, 100),
        createdAt: this.safeParseDate(item.created_at),
        updatedAt: this.safeParseDate(item.updated_at),
        pinned: item.pinned,
        starred: item.starred,
        encrypted: false,
        color: this.getRandomColor(),
      }
    } catch (error) {
      console.error('Error updating note:', error)
      return null
    }
  }

  // Delete note - matches your Rust DELETE endpoint
  // FIXED: Using /notes/id/:id as per Rust backend
  async deleteNote(id: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`${this.endpoint}/id/${id}`)
      return response.status === 200
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  }

  private getRandomColor(): string {
    const colors = [
      'from-purple-500/20 to-pink-500/20',
      'from-blue-500/20 to-cyan-500/20',
      'from-green-500/20 to-emerald-500/20',
      'from-orange-500/20 to-red-500/20',
      'from-indigo-500/20 to-purple-500/20',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

export const notesService = new NotesService()