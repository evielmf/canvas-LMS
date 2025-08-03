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
import CanvasDataManager from '@/components/dashboard/CanvasDataManager'
import AssignmentCard from '@/components/dashboard/AssignmentCard'
import GradeChart from '@/components/dashboard/GradeChart'
import UpcomingReminders from '@/components/dashboard/UpcomingReminders'
import SyncStatusWidget from '@/components/dashboard/SyncStatusWidget'
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
    <div className="py-6">
      {/* Welcome Header with calming design */}
      <div className="mb-10">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-heading font-semibold text-warm-gray-800 mb-3 tracking-tight">
            Good {mounted && new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h1>
          <p className="text-lg text-warm-gray-600 leading-relaxed">
            Take a deep breath and see what's on your peaceful study journey today ✨
          </p>
        </div>
      </div>

      {/* Canvas Token Setup with gentle styling */}
      {!hasToken && !showTokenSetup && !tokenLoading && (
        <div className="mb-10 bg-gradient-sage rounded-3xl p-8 border border-sage-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-sage-200 rounded-2xl">
                <BookOpen className="h-6 w-6 text-sage-700" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-warm-gray-800 mb-2">
                  Connect to Canvas
                </h2>
                <p className="text-warm-gray-600 leading-relaxed">
                  Let's gently sync your Canvas data to create your personalized study sanctuary
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTokenSetup(true)}
              className="bg-white text-sage-700 px-6 py-3 rounded-2xl font-medium shadow-gentle hover:shadow-soft transition-all duration-300 border border-sage-200 hover:border-sage-300"
            >
              Setup Canvas
            </button>
          </div>
        </div>
      )}

      {showTokenSetup && (
        <div className="mb-10">
          <CanvasTokenSetup onComplete={() => {
            setShowTokenSetup(false)
            refetchToken()
          }} />
        </div>
      )}

      {/* Canvas Data Manager with peaceful styling */}
      {hasToken && (
        <div className="mb-10">
          <SyncStatusWidget />
        </div>
      )}

      {/* Stats Cards with calming colors and soft shadows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-sage-100 hover:shadow-soft-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-sage-100 rounded-xl">
              <BookOpen className="h-6 w-6 text-sage-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-warm-gray-500 mb-1">Study Courses</div>
              <div className="text-2xl font-heading font-semibold text-warm-gray-800">
                {courses?.length || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-lavender-100 hover:shadow-soft-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-lavender-100 rounded-xl">
              <Clock className="h-6 w-6 text-lavender-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-warm-gray-500 mb-1">Due Soon</div>
              <div className="text-2xl font-heading font-semibold text-warm-gray-800">
                {mounted ? (upcomingAssignments?.length || 0) : 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-soft-blue-100 hover:shadow-soft-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-soft-blue-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-soft-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-warm-gray-500 mb-1">Completed</div>
              <div className="text-2xl font-heading font-semibold text-warm-gray-800">
                {completedAssignments}/{totalAssignments}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-cream-200 hover:shadow-soft-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cream-200 rounded-xl">
              <TrendingUp className="h-6 w-6 text-warm-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-warm-gray-500 mb-1">Average Grade</div>
              <div className="text-2xl font-heading font-semibold text-warm-gray-800">
                {averageGrade ? `${averageGrade.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Assignments with journal-like design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-sage-100">
          <div className="p-6 border-b border-sage-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-warm-gray-800">
                📝 Upcoming Tasks
              </h2>
              <a 
                href="/dashboard/assignments"
                className="text-sm text-sage-600 hover:text-sage-700 font-medium px-3 py-1 rounded-lg hover:bg-sage-50 transition-all duration-200"
              >
                View all →
              </a>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-soft-pulse">
                    <div className="h-4 bg-sage-100 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-sage-100 rounded-lg w-1/2"></div>
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-sage-500" />
                </div>
                <h3 className="text-lg font-heading font-medium text-warm-gray-800 mb-2">
                  You're all caught up! 🌿
                </h3>
                <p className="text-warm-gray-600 leading-relaxed">
                  Take a moment to breathe. Your upcoming tasks are clear and organized.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Grade Progress with calm design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-lavender-100">
          <div className="p-6 border-b border-lavender-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-warm-gray-800">
                📊 Grade Progress
              </h2>
              <a 
                href="/dashboard/grades"
                className="text-sm text-lavender-500 hover:text-lavender-600 font-medium px-3 py-1 rounded-lg hover:bg-lavender-50 transition-all duration-200"
              >
                View details →
              </a>
            </div>
          </div>
          <div className="p-6">
            <GradeChart grades={grades} />
          </div>
        </div>
      </div>

      {/* Study Reminders with gentle personal assistant vibe */}
      <div className="mt-12">
        <UpcomingReminders />
      </div>
    </div>
  )
}
