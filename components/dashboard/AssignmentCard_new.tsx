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
    if (isOverdue) return 'text-red-600 bg-red-50 border-red-200'
    if (isUrgent) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getPriorityIcon = () => {
    if (isOverdue || isUrgent) {
      return <AlertTriangle className="h-4 w-4" />
    }
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${getPriorityColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {assignment.name}
          </h3>
          {assignment.course && (
            <p className="text-xs text-gray-500 mt-1">
              {assignment.course.name} ({assignment.course.course_code})
            </p>
          )}
          
          <div className="flex items-center mt-2 space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {isOverdue 
                  ? `Overdue by ${Math.abs(hoursUntilDue)}h`
                  : `Due ${format(dueDate, 'MMM d, h:mm a')}`
                }
              </span>
            </div>
            
            {assignment.points_possible && (
              <div className="flex items-center space-x-1">
                <span>{assignment.points_possible} pts</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-4">
          {getPriorityIcon()}
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500">
            {assignment.submission_types?.join(', ') || 'Assignment'}
          </span>
        </div>
        
        <a 
          href={assignment.html_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View Assignment
        </a>
      </div>
    </div>
  )
}
