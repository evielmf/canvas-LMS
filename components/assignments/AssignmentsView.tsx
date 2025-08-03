'use client'

import { useState, useEffect } from 'react'
import { useCanvasData } from '@/hooks/useCanvasData'
import { 
  Calendar,
  Clock, 
  BookOpen,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import AssignmentCard from '@/components/dashboard/AssignmentCard'

const filterOptions = [
  { value: 'all', label: 'All Assignments' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
  { value: 'this-week', label: 'This Week' },
]

export default function AssignmentsView() {
  const { assignments, courses, loading } = useCanvasData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [mounted, setMounted] = useState(false)

  // Ensure data is always an array
  const safeAssignments = assignments || []
  const safeCourses = courses || []

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredAssignments = safeAssignments.filter(assignment => {
    // Search filter
    if (searchTerm && !assignment.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Course filter
    if (selectedCourse && assignment.course_id?.toString() !== selectedCourse) {
      return false
    }

    // Status filter (only apply on client side to avoid hydration mismatch)
    if (!mounted) return true
    
    if (!assignment.due_at) {
      return selectedFilter === 'all' || selectedFilter === 'upcoming'
    }
    
    const now = new Date()
    const dueDate = new Date(assignment.due_at)
    const isCompleted = assignment.submission?.submitted_at
    const isOverdue = isBefore(dueDate, now) && !isCompleted
    const isUpcoming = isAfter(dueDate, now)
    const isThisWeek = isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 7))

    switch (selectedFilter) {
      case 'upcoming':
        return isUpcoming
      case 'overdue':
        return isOverdue
      case 'completed':
        return isCompleted
      case 'this-week':
        return isThisWeek
      default:
        return true
    }
  })

  const stats = {
    total: safeAssignments.length,
    completed: safeAssignments.filter(a => a.submission?.submitted_at).length,
    overdue: mounted ? safeAssignments.filter(a => {
      if (!a.due_at) return false
      const dueDate = new Date(a.due_at)
      return isBefore(dueDate, new Date()) && !a.submission?.submitted_at
    }).length : 0,
    upcoming: mounted ? safeAssignments.filter(a => {
      if (!a.due_at) return false
      const dueDate = new Date(a.due_at)
      return isAfter(dueDate, new Date()) && !a.submission?.submitted_at
    }).length : 0,
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
        <p className="text-gray-600">
          Manage and track all your course assignments in one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Upcoming</div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Overdue</div>
              <div className="text-2xl font-bold text-gray-900">{stats.overdue}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent"
              aria-label="Filter assignments by status"
              title="Filter assignments by status"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent"
              aria-label="Filter assignments by course"
              title="Filter assignments by course"
            >
              <option value="">All Courses</option>
              {safeCourses.map(course => (
                <option key={course.id} value={course.id?.toString()}>
                  {course.course_code || course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredAssignments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAssignments.map((assignment, index) => (
              <div key={assignment.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {assignment.submission?.submitted_at ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {assignment.name || 'Unnamed Assignment'}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span>{safeCourses.find(course => course.id === assignment.course_id)?.name || 'Unknown Course'}</span>
                          <span>•</span>
                          <span>{assignment.points_possible || 0} points</span>
                          <span>•</span>
                          <span>{assignment.submission_types?.join(', ') || 'Assignment'}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          {assignment.due_at && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className={`${
                                mounted && isBefore(new Date(assignment.due_at), new Date()) && !assignment.submission?.submitted_at
                                  ? 'text-red-600 font-medium'
                                  : 'text-gray-600'
                              }`}>
                                Due {format(new Date(assignment.due_at), 'MMM d, yyyy • h:mm a')}
                              </span>
                            </div>
                          )}
                          
                          {assignment.submission?.submitted_at && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>
                                Submitted {format(new Date(assignment.submission.submitted_at), 'MMM d')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {assignment.submission?.score !== undefined && assignment.submission?.score !== null && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.submission?.score || 0}/{assignment.points_possible || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((assignment.submission.score / assignment.points_possible) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                    
                    <a
                      href={assignment.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-canvas-blue hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedFilter !== 'all' || selectedCourse
                ? 'Try adjusting your filters to see more assignments.'
                : 'Connect your Canvas account to see your assignments.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
