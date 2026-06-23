'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface NoteSkeletonProps {
  viewMode?: 'grid' | 'list'
}

export function NoteSkeleton({ viewMode = 'grid' }: NoteSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card className="p-4 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-1/3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
            </div>
            <div className="w-20 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative"
    >
      <Card className="p-6 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse mb-3" />
        
        {/* Content skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
        </div>

        {/* Encryption line skeleton */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
      </Card>
    </motion.div>
  )
}

// Grid of skeletons
export function NoteSkeletonGrid({ count = 6, viewMode = 'grid' }: { count?: number, viewMode?: 'grid' | 'list' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <NoteSkeleton key={i} viewMode={viewMode} />
      ))}
    </>
  )
}