'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Calendar, MessageCircle, X } from 'lucide-react'

interface FloatingActionButtonProps {
  onSync?: () => void
  onAddReminder?: () => void
  onAddSchedule?: () => void
}

export default function FloatingActionButton({ 
  onSync, 
  onAddReminder, 
  onAddSchedule 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide/show FAB on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
        setIsOpen(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className={`fixed bottom-24 right-4 z-50 lg:bottom-8 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
    }`}>
      {/* Speed Dial Actions */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {onSync && (
            <button
              onClick={() => handleAction(onSync)}
              className="flex items-center justify-center w-12 h-12 bg-soft-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              title="Sync Canvas Data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
          
          {onAddReminder && (
            <button
              onClick={() => handleAction(onAddReminder)}
              className="flex items-center justify-center w-12 h-12 bg-lavender-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              title="Add Study Reminder"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          )}
          
          {onAddSchedule && (
            <button
              onClick={() => handleAction(onAddSchedule)}
              className="flex items-center justify-center w-12 h-12 bg-sage-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              title="Add to Schedule"
            >
              <Calendar className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleOpen}
        className={`flex items-center justify-center w-14 h-14 bg-sage-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        title={isOpen ? 'Close' : 'Quick Actions'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  )
}
