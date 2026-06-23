// src/components/notes/NoteCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MoreVertical, 
  Clock, 
  Star, 
  Pin, 
  Lock,
  Edit,
  Trash2,
  Copy,
  Archive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { Note } from '@/store/useNotesStore'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

interface NoteCardProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  onToggleStar: () => void
  index: number
}

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  onToggleStar,
  index 
}: NoteCardProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')

  useEffect(() => {
    try {
      // Handle both string dates and Date objects
      const date = note.updatedAt instanceof Date 
        ? note.updatedAt 
        : new Date(note.updatedAt)
      
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }))
      } else {
        setTimeAgo('recently')
      }
    } catch (error) {
      setTimeAgo('recently')
    }
  }, [note.updatedAt])

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content)
    toast.success('Note copied to clipboard', {
      description: 'Content has been copied',
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${note.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <Card className="relative p-6 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-white/20 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
        {/* Header with actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {note.pinned && (
              <Pin className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            )}
            {note.starred && (
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            )}
            <Lock className="w-3 h-3 text-green-500" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePin}>
                <Pin className="w-4 h-4 mr-2" />
                {note.pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleStar}>
                <Star className="w-4 h-4 mr-2" />
                {note.starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div onClick={onEdit} className="cursor-pointer">
          <h3 className="text-xl font-semibold mb-2 pr-8 line-clamp-1">
            {note.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
            {note.preview}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
          <span className="text-green-500 text-[10px] uppercase tracking-wider">
            Encrypted
          </span>
        </div>

        {/* Encryption indicator line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Card>
    </motion.div>
  )
}