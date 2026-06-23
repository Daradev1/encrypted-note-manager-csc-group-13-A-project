'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Lock, 
  Pin,
  Star,
  LayoutGrid,
  List,
  X,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteSkeletonGrid } from '@/components/notes/NoteSkeleton'
import { SearchFilterBar } from '@/components/notes/SearchFilterBar'
import { DeleteConfirmDialog } from '@/components/notes/DeleteConfirmDialog'
import { useNotesStore } from '@/store/useNotesStore'
import { toast } from 'sonner'

interface NotesPageProps {
  userId: string
}

export default function NotesPage({ userId }: NotesPageProps) {
  // Local state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'pinned' | 'starred'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'updated'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Get store actions and state
  const { 
    notes, 
    searchQuery, 
    setSearchQuery, 
    getFilteredNotes,
    deleteNote,
    togglePin,
    toggleStar,
    fetchNotes,
    refreshCurrentUserNotes,  // Make sure this is imported!
    currentUserId
  } = useNotesStore()

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Fetch notes when userId changes
  useEffect(() => {
    if (userId) {
      console.log('📝 Fetching notes for user:', userId)
      fetchNotes(userId)
    }
  }, [userId, fetchNotes])

  // Refresh handler
  const handleRefresh = async () => {
    if (!currentUserId) {
      toast.error('No user logged in')
      return
    }
    
    setIsRefreshing(true)
    try {
      await refreshCurrentUserNotes()
      toast.success('Notes refreshed', {
        description: 'Your notes are up to date',
      })
    } catch (error) {
      toast.error('Failed to refresh notes')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter and sort notes
  const filteredNotes = getFilteredNotes()
    .filter(note => {
      if (filter === 'pinned') return note.pinned
      if (filter === 'starred') return note.starred
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.pinned).length,
    starred: notes.filter(n => n.starred).length,
  }

  // Event handlers
  const handleEdit = (noteId: string) => {
    setEditingNoteId(noteId)
    setEditorOpen(true)
  }

  const handleNewNote = () => {
    setEditingNoteId(undefined)
    setEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setEditorOpen(false)
    setEditingNoteId(undefined)
  }

  const handleDeleteClick = (id: string, title: string) => {
    setNoteToDelete({ id, title })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id)
      toast.success('Note deleted', {
        description: `"${noteToDelete.title}" has been permanently removed`,
        icon: <Lock className="w-4 h-4" />,
      })
      setNoteToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <>
      <AnimatedBackground />
      
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Logo and title */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70" />
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Secure Notes
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notes.length} notes • End-to-end encrypted
                  </p>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Refresh button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Refresh notes"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>

                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 rounded-full p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={`h-8 w-8 rounded-full ${
                      viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900' : ''
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={`h-8 w-8 rounded-full ${
                      viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900' : ''
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Create button */}
                <Button 
                  onClick={handleNewNote}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Notes', value: stats.total, icon: <Lock className="w-4 h-4" />, color: 'purple' },
              { label: 'Pinned', value: stats.pinned, icon: <Pin className="w-4 h-4" />, color: 'yellow' },
              { label: 'Starred', value: stats.starred, icon: <Star className="w-4 h-4" />, color: 'blue' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-500/20 text-${stat.color}-500`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            totalNotes={notes.length}
            filteredCount={filteredNotes.length}
          />

          {/* Active filters display */}
          {(searchQuery || filter !== 'all') && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  <span>"{searchQuery}"</span>
                  <button onClick={clearSearch} className="ml-1 hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filter !== 'all' && (
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                  {filter === 'pinned' ? <Pin className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  <span className="capitalize">{filter}</span>
                  <button onClick={() => setFilter('all')} className="ml-1 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Notes grid/list */}
          {isLoading ? (
            <NoteSkeletonGrid count={6} viewMode={viewMode} />
          ) : filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-20" />
                <Lock className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600 relative" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No notes found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? `No notes match "${searchQuery}"` 
                  : filter !== 'all' 
                  ? `You don't have any ${filter} notes yet` 
                  : 'Create your first encrypted note to get started'}
              </p>
              {!searchQuery && filter === 'all' && (
                <Button 
                  onClick={handleNewNote}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create your first note
                </Button>
              )}
              {(searchQuery || filter !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setFilter('all')
                  }}
                  className="rounded-full"
                >
                  Clear all filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              layout
              className={viewMode === 'grid' 
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    onEdit={() => handleEdit(note.id)}
                    onDelete={() => handleDeleteClick(note.id, note.title)}
                    onTogglePin={() => togglePin(note.id)}
                    onToggleStar={() => toggleStar(note.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Results summary */}
          {!isLoading && filteredNotes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              Showing {filteredNotes.length} of {notes.length} notes
              {sortBy === 'date' && ` • Sorted by date ${sortOrder === 'desc' ? '(newest first)' : '(oldest first)'}`}
              {sortBy === 'updated' && ` • Sorted by last updated ${sortOrder === 'desc' ? '(recent first)' : '(oldest first)'}`}
              {sortBy === 'title' && ` • Sorted by title ${sortOrder === 'desc' ? '(Z-A)' : '(A-Z)'}`}
            </motion.div>
          )}
        </main>
      </div>

      {/* Note Editor Modal */}
      <AnimatePresence>
        {editorOpen && (
          <NoteEditor
            noteId={editingNoteId}
            onClose={handleCloseEditor}
            userId={userId}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setNoteToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        noteTitle={noteToDelete?.title || ''}
      />
    </>
  )
}