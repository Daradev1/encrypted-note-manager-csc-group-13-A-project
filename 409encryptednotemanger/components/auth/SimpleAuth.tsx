'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Lock, User, LogIn, UserPlus, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface SimpleAuthProps {
  onLogin: (userId: string) => void
}

export function SimpleAuth({ onLogin }: SimpleAuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Check if user was previously logged in
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId')
    if (savedUserId) {
      onLogin(savedUserId)
    }
  }, [onLogin])

  const handleSubmit = () => {
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    setIsLoading(true)

    // Simple: just use the username as userId
    // In production, you'd want better uniqueness, but for demo this works!
    const userId = username.toLowerCase().replace(/\s+/g, '_')
    
    // Save to localStorage
    localStorage.setItem('userId', userId)
    localStorage.setItem('username', username)
    
    toast.success(isLogin ? 'Welcome back!' : 'Account created!', {
      description: `Logged in as ${username}`,
    })
    
    setTimeout(() => {
      setIsLoading(false)
      onLogin(userId)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-4000" />
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-70" />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            {isLogin 
              ? 'Enter your username to access your encrypted notes'
              : 'Choose a username to start securing your notes'
            }
          </p>

          {/* Username Input */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-full relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Lock className="w-5 h-5 animate-pulse" />
                  <span>Securing...</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </>
              )}
            </span>
          </Button>

          {/* Toggle between login/signup */}
          <p className="text-center mt-6 text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 font-medium"
              disabled={isLoading}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          {/* Demo note */}
          <p className="text-center mt-4 text-xs text-gray-400">
            For demo, just enter any username - your notes will be private to you!
          </p>
        </Card>
      </motion.div>
    </motion.div>
  )
}