'use client'

import { toast } from 'sonner'
import { 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Trash2,
  Edit,
  Copy,
  Star,
  Pin, 
  X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from './button'

// Custom toast styles with icons and animations
export const toastStyles = {
  success: (message: string, description?: string) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-2xl"
      >
        <div className="p-2 bg-white/20 rounded-xl">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {description && <p className="text-sm text-white/80">{description}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          onClick={() => toast.dismiss(t)}
        >
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    ), { duration: 4000 })
  },

  encrypting: (message: string) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-2 bg-white/20 rounded-xl"
        >
          <Lock className="w-5 h-5" />
        </motion.div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          <p className="text-sm text-white/80">AES-256-GCM encryption</p>
        </div>
      </motion.div>
    ), { duration: Infinity })
  },

  deleted: (title: string) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl shadow-2xl"
      >
        <div className="p-2 bg-white/20 rounded-xl">
          <Trash2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Note deleted</p>
          <p className="text-sm text-white/80">"{title}" has been permanently removed</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          onClick={() => toast.dismiss(t)}
        >
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    ), { duration: 5000 })
  }
}