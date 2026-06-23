import { Note } from '@/store/useNotesStore'
import { encryptionService } from './encryption.service'

// This simulates what the Rust backend will do
export class MockRustBackend {
  private notes: Map<string, any> = new Map()

  async handleCreateNote(data: { title: string; content: string; clientId: string }) {
    // Simulate Rust encryption
    const encryptedTitle = await encryptionService.encrypt(data.title)
    const encryptedContent = await encryptionService.encrypt(data.content)

    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store encrypted data (simulating Rust DB storage)
    const storedNote = {
      id: noteId,
      encryptedTitle: encryptedTitle.ciphertext,
      encryptedContent: encryptedContent.ciphertext,
      iv: encryptedTitle.iv, // In real impl, might store per field or per note
      authTag: encryptedTitle.tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      starred: false,
    }

    this.notes.set(noteId, storedNote)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    return storedNote
  }

  async handleGetNote(id: string) {
    const note = this.notes.get(id)
    if (!note) return null

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return note
  }

  async handleGetAllNotes() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return Array.from(this.notes.values())
  }

  async handleUpdateNote(id: string, updates: any) {
    const note = this.notes.get(id)
    if (!note) return null

    // If updating title or content, re-encrypt
    if (updates.title) {
      const encrypted = await encryptionService.encrypt(updates.title)
      note.encryptedTitle = encrypted.ciphertext
    }
    if (updates.content) {
      const encrypted = await encryptionService.encrypt(updates.content)
      note.encryptedContent = encrypted.ciphertext
    }

    Object.assign(note, updates, { updatedAt: new Date().toISOString() })
    this.notes.set(id, note)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    return note
  }

  async handleDeleteNote(id: string) {
    const deleted = this.notes.delete(id)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return deleted
  }
}

export const mockRustBackend = new MockRustBackend()