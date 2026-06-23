'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotesStore } from '@/store/useNotesStore'
import { useState } from 'react'

export function SyncStatus() {
  const { syncing, error, syncWithBackend, notes } = useNotesStore()
  const [showDetails, setShowDetails] = useState(false)

  const unsyncedCount = notes.filter(n => !n.synced).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => syncWithBackend()}
        disabled={syncing}
        className="relative rounded-full"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {error ? (
          <AlertCircle className="w-4 h-4 text-red-500" />
        ) : syncing ? (
          <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
        ) : unsyncedCount > 0 ? (
          <CloudOff className="w-4 h-4 text-yellow-500" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
        
        {unsyncedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {unsyncedCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 text-xs"
          >
            {error ? (
              <>
                <p className="font-medium text-red-500">Sync Error</p>
                <p className="text-gray-500 mt-1">{error}</p>
              </>
            ) : syncing ? (
              <>
                <p className="font-medium text-purple-500">Syncing...</p>
                <p className="text-gray-500 mt-1">Please wait</p>
              </>
            ) : unsyncedCount > 0 ? (
              <>
                <p className="font-medium text-yellow-500">Offline Changes</p>
                <p className="text-gray-500 mt-1">
                  {unsyncedCount} note{unsyncedCount > 1 ? 's' : ''} waiting to sync
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-green-500">Synced</p>
                <p className="text-gray-500 mt-1">All notes are backed up</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}