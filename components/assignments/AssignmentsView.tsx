'use client'

import { useState, useEffect } from 'react'
import { useCanvasDataCached } from '@/hooks/useCanvasDataCached'
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
import MobileAssignmentCard from '@/components/dashboard/MobileAssignmentCard'
import FloatingActionButton from '@/components/dashboard/FloatingActionButton'
import BottomSheet from '@/components/ui/BottomSheet'
import PullToRefresh from '@/components/ui/PullToRefresh'
import { AssignmentCardSkeleton } from '@/components/ui/FastLoading'
import { AssignmentsLoading } from '@/components/ui/OptimizedLoading'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor'
import toast from 'react-hot-toast'

const filterOptions = [
  { value: 'all', label: 'All Assignments' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
  { value: 'this-week', label: 'This Week' },
]

export default function AssignmentsView() {
  const { assignments, courses, hasData, syncData } = useCanvasDataCached()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)

  // Ensure data is always an array
  const safeAssignments = assignments || []
  const safeCourses = courses || []

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mobile-specific handlers
  const handleRefresh = async () => {
    await syncData()
    toast.success('Assignments refreshed! 📚')
  }

  const handleMarkComplete = (assignmentId: string) => {
    toast.success('Assignment marked as complete! ✅')
    // TODO: Implement actual completion logic
  }

  const handleSnoozeAssignment = (assignmentId: string) => {
    toast.success('Assignment snoozed! 😴')
    // TODO: Implement actual snooze logic
  }

  const handleSyncAction = async () => {
    await syncData()
    toast.success('Assignments synced! ✨')
  }

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

  // Show no data state if no cached data
  if (!hasData || (!assignments || assignments.length === 0)) {
    return (
      <div className="py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments data</h3>
          <p className="text-gray-500 mb-4">Go to the dashboard and sync your Canvas data to see your assignments.</p>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="py-6">
        {/* Header - Mobile optimized */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-heading font-semibold text-warm-gray-800 mb-2 tracking-tight">
            📚 Your Assignments
          </h1>
          <p className="text-warm-gray-600 leading-relaxed">
            Manage and track all your peaceful study tasks.
          </p>
        </div>

        {/* Stats Cards - Mobile optimized grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-sage-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-sage-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-warm-gray-500">Total</div>
                <div className="text-xl font-heading font-semibold text-warm-gray-800">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-lavender-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lavender-100 rounded-lg">
                <Clock className="h-5 w-5 text-lavender-500" />
              </div>
              <div>
                <div className="text-xs font-medium text-warm-gray-500">Upcoming</div>
                <div className="text-xl font-heading font-semibold text-warm-gray-800">{stats.upcoming}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-red-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-xs font-medium text-warm-gray-500">Overdue</div>
                <div className="text-xl font-heading font-semibold text-warm-gray-800">{stats.overdue}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-xs font-medium text-warm-gray-500">Done</div>
                <div className="text-xl font-heading font-semibold text-warm-gray-800">{stats.completed}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search + Filter Button */}
        <div className="mb-6">
          <div className="flex space-x-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilterSheet(true)}
              title="Open filters"
              aria-label="Open assignment filters"
              className="lg:hidden flex items-center justify-center w-12 h-12 bg-sage-600 text-white rounded-xl shadow-soft hover:bg-sage-700 transition-all duration-200"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex space-x-4 mt-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              title="Filter assignments by status"
              aria-label="Filter assignments by status"
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              title="Filter assignments by course"
              aria-label="Filter assignments by course"
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
            >
              <option value="">All Courses</option>
              {safeCourses.map((course, index) => (
                <option key={course.id || `course-${index}`} value={course.id?.toString()}>
                  {course.course_code || course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="space-y-3 lg:space-y-4">
            {filteredAssignments.map((assignment, index) => (
              <div key={assignment.id || `assignment-${index}`}>
                {/* Desktop assignment card */}
                <div className="hidden lg:block">
                  <AssignmentCard assignment={assignment} />
                </div>
                {/* Mobile assignment card with swipe gestures */}
                <div className="lg:hidden">
                  <MobileAssignmentCard 
                    assignment={assignment}
                    onMarkComplete={handleMarkComplete}
                    onSnooze={handleSnoozeAssignment}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl">
            <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-sage-500" />
            </div>
            <h3 className="text-lg font-heading font-medium text-warm-gray-800 mb-2">
              {searchTerm || selectedFilter !== 'all' || selectedCourse
                ? 'No assignments match your filters 🔍'
                : 'No assignments found 📚'}
            </h3>
            <p className="text-warm-gray-600 leading-relaxed">
              {searchTerm || selectedFilter !== 'all' || selectedCourse
                ? 'Try adjusting your filters to see more assignments.'
                : 'Connect your Canvas account to see your assignments.'}
            </p>
          </div>
        )}

        {/* Mobile Filter Bottom Sheet */}
        <BottomSheet
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          title="Filter Assignments"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warm-gray-800 mb-2">
                Status Filter
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                title="Filter assignments by status"
                aria-label="Filter assignments by status"
                className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-800 mb-2">
                Course Filter
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                title="Filter assignments by course"
                aria-label="Filter assignments by course"
                className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                <option value="">All Courses</option>
                {safeCourses.map((course, index) => (
                  <option key={course.id || `course-${index}`} value={course.id?.toString()}>
                    {course.course_code || course.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFilterSheet(false)}
              className="w-full py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </BottomSheet>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onSync={handleSyncAction}
      />

      {/* Performance Monitor (Development) */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </PullToRefresh>
  )
}
