// src/store/useNotesStore.ts
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { notesService } from "@/services/notes.service";

// Define the Note interface here
export interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  starred: boolean;
  encrypted: boolean;
  color?: string;
  synced?: boolean; // Added synced property
}

// Interface for adding a new note (includes userId)
export interface AddNoteData {
  userId: string;
  title: string;
  content: string;
  pinned: boolean;
  starred: boolean;
}

interface NotesStore {
  notes: Note[];
  loading: boolean;
  searchQuery: string;
  error: string | null;
  currentUserId: string | null;
  syncing: boolean; // Added syncing state

  // API actions
  setCurrentUser: (userId: string) => void;
  fetchNotes: (userId: string) => Promise<void>;
  addNote: (noteData: AddNoteData) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  refreshCurrentUserNotes: () => Promise<void>;
  syncWithBackend: () => Promise<void>; // Added sync function

  // UI actions
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];
  clearError: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  loading: false,
  searchQuery: "",
  error: null,
  currentUserId: null,
  syncing: false, // Initialize syncing state

  // Set current user
  setCurrentUser: (userId: string) => {
    set({ currentUserId: userId });
  },

  // Fetch all notes from Rust backend for specific user
  fetchNotes: async (userId: string) => {
    set({ loading: true, error: null, currentUserId: userId });
    try {
      const notes = await notesService.getAllNotes(userId);
      // Mark all notes as synced when fetched
      const notesWithSyncStatus = notes.map((note) => ({
        ...note,
        synced: true,
      }));
      set({ notes: notesWithSyncStatus, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch notes",
        loading: false,
      });
    }
  },

  // Helper to refresh notes for current user
  refreshCurrentUserNotes: async () => {
    const { currentUserId } = get();
    if (currentUserId) {
      console.log("🔄 Refreshing notes for user:", currentUserId);
      try {
        const notes = await notesService.getAllNotes(currentUserId);
        const notesWithSyncStatus = notes.map((note) => ({
          ...note,
          synced: true,
        }));
        set({ notes: notesWithSyncStatus });
      } catch (error) {
        console.error("Failed to refresh notes:", error);
      }
    }
  },

  // Add note to Rust backend with user ID
  addNote: async (noteData: AddNoteData) => {
    const tempId = uuidv4();
    const now = new Date();

    // Optimistic update - mark as not synced
    const tempNote: Note = {
      id: tempId,
      title: noteData.title,
      content: noteData.content,
      preview:
        noteData.content.substring(0, 100) +
        (noteData.content.length > 100 ? "..." : ""),
      createdAt: now,
      updatedAt: now,
      pinned: noteData.pinned,
      starred: noteData.starred,
      encrypted: false,
      color: getRandomColor(),
      synced: false, // Mark as not synced initially
    };

    set((state) => ({
      notes: [tempNote, ...state.notes],
    }));

    // Actually create in backend with user_id
    try {
      const created = await notesService.createNote({
        user_id: noteData.userId,
        title: noteData.title,
        content: noteData.content,
      });

      if (created) {
        // Replace temp note with real one and mark as synced
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === tempId ? { ...created, synced: true } : note,
          ),
        }));

        // Refresh to ensure we have latest data
        await get().refreshCurrentUserNotes();
      } else {
        // Remove temp note on failure
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== tempId),
          error: "Failed to create note",
        }));
      }
    } catch (error) {
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== tempId),
        error: error instanceof Error ? error.message : "Failed to create note",
      }));
    }
  },

  // Update note in Rust backend
  updateNote: async (id, updates) => {
    const originalNotes = get().notes;
    const originalNote = originalNotes.find((n) => n.id === id);

    if (!originalNote) return;

    // Optimistic update - mark as not synced
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date(), synced: false }
          : note,
      ),
    }));

    // Actually update in backend
    try {
      const updated = await notesService.updateNote(id, {
        title: updates.title,
        content: updates.content,
        pinned: updates.pinned,
        starred: updates.starred,
      });

      if (updated) {
        // Refresh to get the updated note with proper encryption
        await get().refreshCurrentUserNotes();
      } else {
        // Rollback on failure
        set({ notes: originalNotes, error: "Failed to update note" });
      }
    } catch (error) {
      set({
        notes: originalNotes,
        error: error instanceof Error ? error.message : "Failed to update note",
      });
      await get().refreshCurrentUserNotes(); // Try to refresh anyway
    }
  },

  // Delete note from Rust backend
  deleteNote: async (id) => {
    const originalNotes = get().notes;

    // Optimistic update
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));

    // Actually delete from backend
    try {
      const deleted = await notesService.deleteNote(id);
      if (!deleted) {
        // Rollback on failure
        set({ notes: originalNotes, error: "Failed to delete note" });
        await get().refreshCurrentUserNotes(); // Refresh to be safe
      } else {
        // Success - refresh to ensure consistency
        await get().refreshCurrentUserNotes();
      }
    } catch (error) {
      set({
        notes: originalNotes,
        error: error instanceof Error ? error.message : "Failed to delete note",
      });
      await get().refreshCurrentUserNotes(); // Try to refresh anyway
    }
  },

  // Sync with backend - new function
  syncWithBackend: async () => {
    const { notes, currentUserId, refreshCurrentUserNotes } = get();

    if (!currentUserId) {
      set({ error: "No user logged in" });
      return;
    }

    set({ syncing: true, error: null });

    try {
      // Get all unsynced notes
      const unsyncedNotes = notes.filter((note) => !note.synced);

      if (unsyncedNotes.length === 0) {
        // If no unsynced notes, just refresh
        await refreshCurrentUserNotes();
        set({ syncing: false });
        return;
      }

      console.log(`🔄 Syncing ${unsyncedNotes.length} notes...`);

      // For each unsynced note, try to sync it
      for (const note of unsyncedNotes) {
        // Check if note exists in backend
        try {
          // Try to update or create the note
          const existingNote = await notesService.getNoteById(note.id);

          if (existingNote) {
            // Update existing note
            await notesService.updateNote(note.id, {
              title: note.title,
              content: note.content,
              pinned: note.pinned,
              starred: note.starred,
            });
          } else {
            // Create new note if it doesn't exist
            await notesService.createNote({
              user_id: currentUserId,
              title: note.title,
              content: note.content,
            });
          }

          // Mark as synced
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === note.id ? { ...n, synced: true } : n,
            ),
          }));
        } catch (error) {
          console.error(`Failed to sync note ${note.id}:`, error);
          // Keep as unsynced and continue
        }
      }

      // Final refresh to ensure consistency
      await refreshCurrentUserNotes();
      set({ syncing: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Sync failed",
        syncing: false,
      });
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) {
      console.log(
        "📌 Toggling pin for note:",
        id,
        "from",
        note.pinned,
        "to",
        !note.pinned,
      );
      await get().updateNote(id, { pinned: !note.pinned });
    }
  },

  toggleStar: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) {
      console.log(
        "⭐ Toggling star for note:",
        id,
        "from",
        note.starred,
        "to",
        !note.starred,
      );
      await get().updateNote(id, { starred: !note.starred });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    if (!searchQuery) return notes;

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  },

  clearError: () => set({ error: null }),
}));

// Helper function for random colors
function getRandomColor(): string {
  const colors = [
    "from-purple-500/20 to-pink-500/20",
    "from-blue-500/20 to-cyan-500/20",
    "from-green-500/20 to-emerald-500/20",
    "from-orange-500/20 to-red-500/20",
    "from-indigo-500/20 to-purple-500/20",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
