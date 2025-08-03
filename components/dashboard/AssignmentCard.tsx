'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { CanvasAssignment } from '@/hooks/useCanvasData'

interface AssignmentCardProps {
  assignment: CanvasAssignment
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!assignment.due_at) {
    return null // Don't render assignments without due dates
  }

  const dueDate = new Date(assignment.due_at)
  const now = new Date()
  const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
  
  const isUrgent = mounted && hoursUntilDue <= 24
  const isOverdue = mounted && hoursUntilDue < 0

  const getPriorityColor = () => {
    if (isOverdue) return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700'
    if (isUrgent) return 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200 text-orange-700'
    return 'bg-gradient-to-br from-sage-50 to-cream-50 border-sage-200 text-sage-700'
  }

  const getPriorityIcon = () => {
    if (isOverdue || isUrgent) {
      return <AlertTriangle className="h-4 w-4" />
    }
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-gentle ${getPriorityColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-warm-gray-800 truncate leading-relaxed">
            {assignment.name}
          </h3>
          {assignment.course && (
            <p className="text-sm text-warm-gray-600 mt-1 font-medium">
              {assignment.course.name}
            </p>
          )}
          
          <div className="flex items-center mt-3 space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 opacity-70" />
              <span className="font-medium">
                {isOverdue 
                  ? `Overdue by ${Math.abs(hoursUntilDue)}h`
                  : `Due ${format(dueDate, 'MMM d, h:mm a')}`
                }
              </span>
            </div>
            
            {assignment.points_possible && (
              <div className="flex items-center space-x-1">
                <span className="text-sm opacity-80">{assignment.points_possible} pts</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-4">
          <div className="p-2 bg-white/60 rounded-lg">
            {getPriorityIcon()}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-warm-gray-600 bg-white/60 px-2 py-1 rounded-lg font-medium">
            {assignment.submission_types?.join(', ') || 'Assignment'}
          </span>
        </div>
        
        <a 
          href={assignment.html_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium px-3 py-1 bg-white/80 rounded-lg hover:bg-white transition-all duration-200 hover:shadow-gentle"
        >
          Open →
        </a>
      </div>
    </div>
  )
}
