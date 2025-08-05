'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, AlertTriangle, Check, ZapOff } from 'lucide-react'
import { CanvasAssignment } from '@/hooks/useCanvasData'

interface MobileAssignmentCardProps {
  assignment: CanvasAssignment
  onMarkComplete?: (id: string) => void
  onSnooze?: (id: string) => void
}

export default function MobileAssignmentCard({ 
  assignment, 
  onMarkComplete, 
  onSnooze 
}: MobileAssignmentCardProps) {
  const [mounted, setMounted] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!assignment.due_at) {
    return null
  }

  const dueDate = new Date(assignment.due_at)
  const now = new Date()
  const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
  
  const isUrgent = mounted && hoursUntilDue <= 24
  const isOverdue = mounted && hoursUntilDue < 0

  const getPriorityColor = () => {
    if (isOverdue) return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
    if (isUrgent) return 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200'
    return 'bg-gradient-to-br from-sage-50 to-cream-50 border-sage-200'
  }

  const getPriorityBadge = () => {
    if (isOverdue) return 'Overdue'
    if (isUrgent) return 'Due Today'
    if (hoursUntilDue <= 48) return 'Tomorrow'
    return format(dueDate, 'MMM d')
  }

  // Touch/drag handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentX = e.touches[0].clientX
    const offset = currentX - startX
    
    // Limit drag to reasonable range
    const maxOffset = 120
    const constrainedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset))
    setDragOffset(constrainedOffset)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    // Handle swipe actions
    if (Math.abs(dragOffset) > 60) {
      if (dragOffset > 0 && onMarkComplete) {
        // Swipe right - mark complete
        onMarkComplete(assignment.id.toString())
      } else if (dragOffset < 0 && onSnooze) {
        // Swipe left - snooze
        onSnooze(assignment.id.toString())
      }
    }
    
    // Reset position
    setDragOffset(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const currentX = e.clientX
    const offset = currentX - startX
    
    const maxOffset = 120
    const constrainedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset))
    setDragOffset(constrainedOffset)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    
    if (Math.abs(dragOffset) > 60) {
      if (dragOffset > 0 && onMarkComplete) {
        onMarkComplete(assignment.id.toString())
      } else if (dragOffset < 0 && onSnooze) {
        onSnooze(assignment.id.toString())
      }
    }
    
    setDragOffset(0)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action indicators */}
      {dragOffset !== 0 && (
        <>
          {dragOffset > 0 && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center space-x-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
          {dragOffset < 0 && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center space-x-2 text-orange-600">
              <ZapOff className="h-5 w-5" />
              <span className="text-sm font-medium">Snooze</span>
            </div>
          )}
        </>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className={`${getPriorityColor()} border transition-all duration-200 hover:shadow-gentle cursor-pointer select-none`}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Mobile optimized layout */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-warm-gray-800 line-clamp-2 leading-tight">
                {assignment.name}
              </h3>
              {assignment.course && (
                <p className="text-sm text-warm-gray-600 mt-1 font-medium">
                  {assignment.course.name}
                </p>
              )}
            </div>
            
            {/* Priority badge */}
            <div className={`ml-3 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              isOverdue 
                ? 'bg-red-100 text-red-700' 
                : isUrgent 
                ? 'bg-orange-100 text-orange-700'
                : 'bg-sage-100 text-sage-700'
            }`}>
              {getPriorityBadge()}
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-warm-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 opacity-70" />
                <span className="font-medium">
                  {format(dueDate, 'h:mm a')}
                </span>
              </div>
              
              {assignment.points_possible && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm opacity-80">{assignment.points_possible} pts</span>
                </div>
              )}
            </div>
            
            {/* Action button */}
            <a 
              href={assignment.html_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-3 py-1 bg-white/80 rounded-lg hover:bg-white transition-all duration-200 hover:shadow-gentle"
              onClick={(e) => e.stopPropagation()}
            >
              Open
            </a>
          </div>

          {/* Swipe hint for first-time users */}
          {dragOffset === 0 && (
            <div className="mt-3 pt-3 border-t border-white/50">
              <p className="text-xs text-warm-gray-500 text-center">
                💡 Swipe right to complete • Swipe left to snooze
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
