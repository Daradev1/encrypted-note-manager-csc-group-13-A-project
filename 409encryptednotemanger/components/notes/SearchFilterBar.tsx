'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  X, 
  SlidersHorizontal,
  Pin,
  Star,
  Clock,
  Calendar,
  SortAsc,
  SortDesc,
  Filter,
  ChevronDown
} from 'lucide-react'

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filter: 'all' | 'pinned' | 'starred'
  onFilterChange: (filter: 'all' | 'pinned' | 'starred') => void
  sortBy: 'date' | 'title' | 'updated'
  onSortChange: (sort: 'date' | 'title' | 'updated') => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: () => void
  totalNotes: number
  filteredCount: number
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  totalNotes,
  filteredCount
}: SearchFilterBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        onSearchChange('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, onSearchChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-3 mb-6"
    >
      {/* Search bar */}
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-50" />
        <div className={`relative flex items-center transition-all duration-300 ${
          isFocused ? 'scale-[1.02]' : ''
        }`}>
          <Search className="absolute left-4 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search notes... (⌘K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-10 pr-10 bg-white/70 dark:bg-gray-900/70 border-white/30 backdrop-blur-xl rounded-full h-12"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-3"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => onSearchChange('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 px-4 rounded-full bg-white/70 dark:bg-gray-900/70 border-white/30 backdrop-blur-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="capitalize">{filter}</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onFilterChange('all')}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              All Notes
            </span>
            {filter === 'all' && <span className="ml-auto text-xs text-purple-500">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('pinned')}>
            <span className="flex items-center gap-2">
              <Pin className="w-4 h-4" />
              Pinned
            </span>
            {filter === 'pinned' && <span className="ml-auto text-xs text-purple-500">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('starred')}>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Starred
            </span>
            {filter === 'starred' && <span className="ml-auto text-xs text-purple-500">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSortOrderChange}>
            <span className="flex items-center gap-2">
              {sortOrder === 'desc' ? (
                <SortDesc className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
              {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 px-4 rounded-full bg-white/70 dark:bg-gray-900/70 border-white/30 backdrop-blur-xl"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="capitalize">Sort by {sortBy}</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onSortChange('date')}>
            <Clock className="w-4 h-4 mr-2" />
            Date created
            {sortBy === 'date' && <span className="ml-auto text-xs text-purple-500">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('updated')}>
            <Calendar className="w-4 h-4 mr-2" />
            Last updated
            {sortBy === 'updated' && <span className="ml-auto text-xs text-purple-500">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('title')}>
            <span className="capitalize">Title</span>
            {sortBy === 'title' && <span className="ml-auto text-xs text-purple-500">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Results count */}
      <motion.div 
        key={`${filteredCount}-${totalNotes}`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex items-center px-4 h-12 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-full border border-white/30"
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold">{filteredCount}</span>
          {' '}of{' '}
          <span className="font-semibold">{totalNotes}</span>
          {' '}notes
        </span>
      </motion.div>
    </motion.div>
  )
}