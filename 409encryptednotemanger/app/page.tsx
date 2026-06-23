'use client'

import { useState, useEffect } from 'react'
import { SimpleAuth } from '@/components/auth/SimpleAuth'
import NotesPage from './notes/page'
import LandingPage from '../components/notes/LandingPage' // Import the landing page

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId')
    if (savedUserId) {
      setUserId(savedUserId)
    }
  }, [])

  // Handle getting started click from landing page
  const handleGetStarted = () => {
    setShowAuth(true)
  }

  // Handle successful login
  const handleLogin = (newUserId: string) => {
    setUserId(newUserId)
    setShowAuth(false)
  }

  // Handle back to landing
  const handleBackToLanding = () => {
    setShowAuth(false)
  }

  // If user is logged in, show notes page
  if (userId) {
    return <NotesPage userId={userId} />
  }

  // If showing auth modal, show landing page with auth overlay
  if (showAuth) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleBackToLanding} 
          />
          <div className="relative z-10 w-full max-w-md">
            <SimpleAuth onLogin={handleLogin} />
          </div>
        </div>
      </>
    )
  }

  // Show landing page
  return <LandingPage onGetStarted={handleGetStarted} />
}