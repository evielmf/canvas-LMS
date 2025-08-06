'use client'

import { useState } from 'react'
import { X, Play, Pause, Save, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from '@/app/providers'
import { toast } from 'react-hot-toast'

interface StudySessionModalProps {
  isOpen: boolean
  onClose: () => void
  courses?: Array<{ id: string; name: string }>
  onSessionSaved?: () => void
}

export default function StudySessionModal({ 
  isOpen, 
  onClose, 
  courses = [],
  onSessionSaved 
}: StudySessionModalProps) {
  const { user } = useSupabase()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [customCourseName, setCustomCourseName] = useState('')
  const [activityType, setActivityType] = useState('study')
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const courseName = selectedCourse === 'custom' ? customCourseName : 
                        courses.find(c => c.id === selectedCourse)?.name || 'General Study'

      const response = await fetch('/api/analytics/study-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: selectedCourse === 'custom' ? null : selectedCourse,
          course_name: courseName,
          duration_minutes: duration,
          activity_type: activityType,
          notes: notes.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save study session')
      }

      toast.success('Study session logged! 📚')
      
      // Reset form
      setSelectedCourse('')
      setCustomCourseName('')
      setActivityType('study')
      setDuration(30)
      setNotes('')
      
      onSessionSaved?.()
      onClose()
    } catch (error) {
      console.error('Error saving study session:', error)
      toast.error('Failed to save study session')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <Clock className="h-5 w-5 text-sage-600 mr-2" />
            Log Study Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-warm-gray-400 hover:text-warm-gray-600 rounded-lg hover:bg-warm-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-warm-gray-700 mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-warm-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
              <option value="custom">Other / Custom</option>
            </select>
          </div>

          {/* Custom Course Name */}
          {selectedCourse === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={customCourseName}
                onChange={(e) => setCustomCourseName(e.target.value)}
                placeholder="Enter course name"
                className="w-full px-3 py-2 border border-warm-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                required
              />
            </div>
          )}

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-warm-gray-700 mb-2">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3 py-2 border border-warm-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            >
              <option value="study">Study Session</option>
              <option value="assignment">Assignment Work</option>
              <option value="review">Review & Practice</option>
              <option value="reading">Reading</option>
              <option value="project">Project Work</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-warm-gray-700 mb-2">
              Duration (minutes)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-warm-gray-700 w-16">
                {duration}m
              </span>
            </div>
            <div className="flex justify-between text-xs text-warm-gray-500 mt-1">
              <span>5 min</span>
              <span>5 hours</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-warm-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              className="w-full px-3 py-2 border border-warm-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-warm-gray-700 bg-warm-gray-100 rounded-lg hover:bg-warm-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
