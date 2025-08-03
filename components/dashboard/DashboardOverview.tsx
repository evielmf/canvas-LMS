'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { 
  Calendar,
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react'
import CanvasTokenSetup from '@/components/dashboard/CanvasTokenSetup'
import AssignmentCard from '@/components/dashboard/AssignmentCard'
import GradeChart from '@/components/dashboard/GradeChart'
import UpcomingReminders from '@/components/dashboard/UpcomingReminders'
import { useCanvasData } from '@/hooks/useCanvasData'
import { useCanvasToken } from '@/hooks/useCanvasToken'

export default function DashboardOverview() {
  const { user } = useSupabase()
  const { assignments, courses, grades, loading } = useCanvasData()
  const { hasToken, isLoading: tokenLoading, refetch: refetchToken } = useCanvasToken()
  const [showTokenSetup, setShowTokenSetup] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get upcoming assignments (next 7 days) - only on client side
  const upcomingAssignments = mounted && assignments
    ? assignments
        .filter(assignment => {
          if (!assignment.due_at) return false
          const dueDate = new Date(assignment.due_at)
          const today = new Date()
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          return dueDate >= today && dueDate <= nextWeek && !assignment.submission?.submitted_at
        })
        .sort((a, b) => {
          const aDate = a.due_at ? new Date(a.due_at).getTime() : 0
          const bDate = b.due_at ? new Date(b.due_at).getTime() : 0
          return aDate - bDate
        })
        .slice(0, 5)
    : []

  // Calculate stats
  const totalAssignments = assignments?.length || 0
  const completedAssignments = assignments?.filter(a => a.submission?.submitted_at).length || 0
  const averageGrade = grades?.length ? 
    grades.reduce((sum, grade) => sum + (grade.score || 0), 0) / grades.length : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your courses today.
        </p>
      </div>

      {/* Canvas Token Setup */}
      {!hasToken && !showTokenSetup && !tokenLoading && (
        <div className="mb-8 bg-gradient-to-r from-canvas-blue to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Connect Your Canvas Account</h2>
              <p className="text-blue-100">
                Add your Canvas API token to sync your assignments, grades, and schedule.
              </p>
            </div>
            <button
              onClick={() => setShowTokenSetup(true)}
              className="bg-white text-canvas-blue px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Setup Canvas
            </button>
          </div>
        </div>
      )}

      {showTokenSetup && (
        <div className="mb-8">
          <CanvasTokenSetup onComplete={() => {
            setShowTokenSetup(false)
            refetchToken() // Refresh token status
          }} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Courses</div>
              <div className="text-2xl font-bold text-gray-900">{courses?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Assignments Due</div>
              <div className="text-2xl font-bold text-gray-900">
                {mounted ? (upcomingAssignments?.length || 0) : 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-gray-900">
                {completedAssignments}/{totalAssignments}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Average Grade</div>
              <div className="text-2xl font-bold text-gray-900">
                {averageGrade ? `${averageGrade.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
              <a 
                href="/dashboard/assignments"
                className="text-sm text-canvas-blue hover:text-blue-700 font-medium"
              >
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : mounted && upcomingAssignments && upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming assignments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Great job! You're all caught up.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Grade Progress */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Grade Progress</h2>
              <a 
                href="/dashboard/grades"
                className="text-sm text-canvas-blue hover:text-blue-700 font-medium"
              >
                View details
              </a>
            </div>
          </div>
          <div className="p-6">
            <GradeChart grades={grades} />
          </div>
        </div>
      </div>

      {/* Study Reminders */}
      <div className="mt-8">
        <UpcomingReminders />
      </div>
    </div>
  )
}
