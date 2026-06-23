'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Lock, 
  Unlock, 
  X, 
  Save,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Hash,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useNotesStore } from '@/store/useNotesStore'

interface NoteEditorProps {
  noteId?: string
  onClose: () => void
  userId: string  // Make sure this is included!
}

// FIX 1: Added userId to props destructuring
export function NoteEditor({ noteId, onClose, userId }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [encryptionProgress, setEncryptionProgress] = useState(0)
  const [titleError, setTitleError] = useState(false)
  
  const editorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { addNote, updateNote, notes, loading } = useNotesStore()

  // Load note if editing
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId)
      if (note) {
        setTitle(note.title)
        setContent(note.content)
      }
    } else {
      // Focus title input for new notes
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [noteId, notes])

  // Simulate encryption animation
  useEffect(() => {
    if (isEncrypting) {
      const interval = setInterval(() => {
        setEncryptionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isEncrypting])

  // Reset encryption progress when done
  useEffect(() => {
    if (encryptionProgress === 100) {
      const timer = setTimeout(() => {
        setIsEncrypting(false)
        setEncryptionProgress(0)
        onClose()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [encryptionProgress, onClose])

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setTitleError(true)
      toast.error('Title required', {
        description: 'Please add a title for your note',
        icon: <AlertCircle className="w-4 h-4" />,
      })
      titleInputRef.current?.focus()
      return false
    }
    return true
  }

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm()) return

    setIsEncrypting(true)
    setTitleError(false)

    // Show encryption starting toast
    toast.info('Encrypting your note...', {
      description: 'Using AES-256-GCM encryption',
      duration: 2000,
    })

    // Simulate encryption delay with progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setEncryptionProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        
        // Save the note
        if (noteId) {
          updateNote(noteId, { title: title.trim(), content })
          toast.success('Note updated successfully', {
            description: 'Your changes have been encrypted and saved',
            icon: <Lock className="w-4 h-4" />,
          })
        } else {
          // FIX 2: Pass userId to addNote
          addNote({ 
            userId: userId,  // Add the userId here!
            title: title.trim(), 
            content, 
            pinned: false, 
            starred: false
          })
          toast.success('Note created successfully', {
            description: 'Your note has been encrypted and stored securely',
            icon: <Shield className="w-4 h-4" />,
          })
        }
      }
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    
    // Escape to close (if not fullscreen)
    if (e.key === 'Escape' && !isFullscreen) {
      onClose()
    }
  }

  const insertMarkdown = (type: string) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newText = ''
    let cursorOffset = 0
    
    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        cursorOffset = selectedText ? 2 : 11
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        cursorOffset = selectedText ? 1 : 12
        break
      case 'heading':
        newText = `# ${selectedText || 'Heading'}`
        cursorOffset = selectedText ? 2 : 8
        break
      case 'list':
        newText = `- ${selectedText || 'List item'}`
        cursorOffset = selectedText ? 2 : 10
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        cursorOffset = selectedText ? 1 : 13
        break
      default:
        return
    }

    setContent(content.substring(0, start) + newText + content.substring(end))
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + (selectedText ? newText.length : newText.length - cursorOffset)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isEncrypting) {
          onClose()
        }
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Editor Modal */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-4xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-2xl shadow-2xl overflow-hidden ${
          isFullscreen ? 'fixed inset-4 md:inset-8' : ''
        }`}
      >
        {/* Encryption Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: '0%' }}
            animate={{ width: `${encryptionProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70" />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                {isEncrypting ? (
                  <Lock className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <Shield className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {noteId ? 'Edit Note' : 'Create New Note'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEncrypting 
                  ? `Encrypting... ${encryptionProgress}%` 
                  : 'End-to-end encrypted • Cmd+Enter to save'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={isEncrypting}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={isEncrypting}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={isEncrypting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSave} onKeyDown={handleKeyDown}>
          {/* Title Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Input
              ref={titleInputRef}
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(false)
              }}
              className={`text-xl font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-gray-400 ${
                titleError ? 'border-l-2 border-red-500 pl-2' : ''
              }`}
              disabled={isEncrypting}
            />
            {titleError && (
              <p className="text-xs text-red-500 mt-1">Title is required</p>
            )}
          </div>

          {/* Markdown Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('heading')}
              className="h-8 w-8 rounded-lg"
              disabled={isEncrypting}
            >
              <Hash className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('bold')}
              className="h-8 w-8 rounded-lg font-bold"
              disabled={isEncrypting}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('italic')}
              className="h-8 w-8 rounded-lg italic"
              disabled={isEncrypting}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('list')}
              className="h-8 w-8 rounded-lg"
              disabled={isEncrypting}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('link')}
              className="h-8 w-8 rounded-lg"
              disabled={isEncrypting}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />
            <span className="text-xs text-gray-500">
              Markdown supported
            </span>
          </div>

          {/* Editor/Preview Area */}
          <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4 p-4 overflow-auto`} 
               style={{ maxHeight: isFullscreen ? 'calc(100vh - 280px)' : 'calc(90vh - 280px)' }}>
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here... (Markdown supported)"
                className="min-h-[300px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0 font-mono text-sm"
                disabled={isEncrypting}
              />
              {isEncrypting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer pointer-events-none" />
              )}
            </div>

            {showPreview && (
              <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-auto">
                <h1 className="text-2xl font-bold mb-4">
                  {title || 'Untitled'}
                </h1>
                <div className="whitespace-pre-wrap">
                  {content || 'Nothing to preview yet...'}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>AES-256-GCM Encryption</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="font-mono">{content.length} characters</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-full"
                disabled={isEncrypting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isEncrypting || loading}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full min-w-[120px]"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isEncrypting ? (
                    <>
                      <Lock className="w-4 h-4 animate-pulse" />
                      <span>Encrypting {encryptionProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{noteId ? 'Update Note' : 'Save Note'}</span>
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}