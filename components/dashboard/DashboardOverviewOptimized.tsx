'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/app/providers'
import { useCanvasData, useCanvasDataParallel, CanvasAssignment, CanvasCourse, CanvasGrade } from '@/hooks/useCanvasData'
import { useCanvasToken } from '@/hooks/useCanvasToken'
import { 
  Calendar,
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw
} from 'lucide-react'
import CanvasTokenSetup from '@/components/dashboard/CanvasTokenSetup'
import CanvasDataManager from '@/components/dashboard/CanvasDataManager'
import AssignmentCard from '@/components/dashboard/AssignmentCard'
import MobileAssignmentCard from '@/components/dashboard/MobileAssignmentCard'
import GradeChart from '@/components/dashboard/GradeChart'
import UpcomingReminders from '@/components/dashboard/UpcomingReminders'
import SyncStatusWidget from '@/components/dashboard/SyncStatusWidget'
import FloatingActionButton from '@/components/dashboard/FloatingActionButton'
import PullToRefresh from '@/components/ui/PullToRefresh'
import StudyConsistencyHeatmap from '@/components/analytics/StudyConsistencyHeatmap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast from 'react-hot-toast'

// Performance monitoring component
const PerformanceMetrics = ({ loading, fetchTime }: { loading: boolean, fetchTime?: number }) => {
  const [renderTime, setRenderTime] = useState<number>(0)
  
  useEffect(() => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      setRenderTime(endTime - startTime)
    }
  }, [])

  if (process.env.NODE_ENV === 'development' && !loading && fetchTime) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50">
        📊 Fetch: {fetchTime.toFixed(1)}ms | Render: {renderTime.toFixed(1)}ms
      </div>
    )
  }
  
  return null
}

export default function DashboardOverviewOptimized() {
  const { user } = useSupabase()
  
  // Use the parallel fetching hook for maximum speed
  const { 
    data: parallelData, 
    isLoading: parallelLoading, 
    error: parallelError,
    refetch: refetchParallel 
  } = useCanvasDataParallel()
  
  // Fallback to individual hooks if parallel fails
  const { 
    assignments: fallbackAssignments, 
    courses: fallbackCourses, 
    grades: fallbackGrades, 
    loading: fallbackLoading, 
    refetch: fallbackRefetch,
    preloadData,
    backgroundRefresh
  } = useCanvasData()
  
  const { hasToken, isLoading: tokenLoading, refetch: refetchToken } = useCanvasToken()
  const [showTokenSetup, setShowTokenSetup] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Use parallel data if available, otherwise fallback
  const assignments = parallelData?.assignments || fallbackAssignments
  const courses = parallelData?.courses || fallbackCourses
  const grades = parallelData?.grades || fallbackGrades
  const loading = parallelLoading || fallbackLoading
  const fetchTime = parallelData?.fetchTime

  useEffect(() => {
    setMounted(true)
    
    // Preload critical data on mount
    if (user && hasToken) {
      console.log('🚀 Dashboard mounted - preloading data...')
      preloadData()
      
      // Background refresh stale data
      setTimeout(() => {
        backgroundRefresh()
      }, 1000)
    }
  }, [user, hasToken, preloadData, backgroundRefresh])

  // Optimized refresh with performance tracking
  const handleRefresh = useCallback(async () => {
    const refreshStart = performance.now()
    console.log('🔄 Dashboard refresh started...')
    
    try {
      if (parallelData) {
        await refetchParallel()
      } else {
        await fallbackRefetch()
      }
      
      const refreshTime = performance.now() - refreshStart
      console.log(`⚡ Dashboard refresh completed in ${refreshTime.toFixed(1)}ms`)
      toast.success(`Dashboard refreshed in ${refreshTime.toFixed(0)}ms! 🌿`)
    } catch (error) {
      console.error('❌ Dashboard refresh failed:', error)
      toast.error('Refresh failed - please try again')
    }
  }, [parallelData, refetchParallel, fallbackRefetch])

  // Handle FAB actions with performance tracking
  const handleSyncAction = useCallback(async () => {
    const syncStart = performance.now()
    await handleRefresh()
    const syncTime = performance.now() - syncStart
    toast.success(`Data synced in ${syncTime.toFixed(0)}ms! ✨`)
  }, [handleRefresh])

  const handleAddReminder = useCallback(() => {
    toast.success('Study reminder feature coming soon! 📚')
  }, [])

  const handleAddSchedule = useCallback(() => {
    toast.success('Schedule management coming soon! 📅')
  }, [])

  // Handle mobile assignment actions
  const handleMarkComplete = useCallback((assignmentId: string) => {
    toast.success('Assignment marked as complete! ✅')
    // TODO: Implement actual completion logic
  }, [])

  const handleSnoozeAssignment = useCallback((assignmentId: string) => {
    toast.success('Assignment snoozed for 1 hour! ⏰')
    // TODO: Implement snooze logic
  }, [])

  // Performance-optimized data processing
interface Assignment extends CanvasAssignment {
    dueDate?: Date
}

const upcomingAssignments: Assignment[] | undefined = assignments
    ?.filter((assignment: Assignment) => {
        if (!assignment.due_at) return false
        const dueDate = new Date(assignment.due_at)
        const now = new Date()
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(now.getDate() + 7)
        return dueDate >= now && dueDate <= sevenDaysFromNow
    })
    .sort((a: Assignment, b: Assignment) => {
        if (!a.due_at || !b.due_at) return 0
        const aDate: number = a.due_at ? new Date(a.due_at).getTime() : 0
        const bDate: number = b.due_at ? new Date(b.due_at).getTime() : 0
        return aDate - bDate
    })
    .slice(0, 5)

  // Calculate stats efficiently
  const totalAssignments = assignments?.length || 0

const completedAssignments: number = assignments?.filter((a: Assignment) => a.submission?.submitted_at).length || 0
interface Grade {
    score?: number;
    [key: string]: any;
}

const averageGrade: number = grades?.length ? 
    grades.reduce((sum: number, grade: Grade) => sum + (grade.score || 0), 0) / grades.length : 0

  // Show performance metrics in development
  const showPerfMetrics = process.env.NODE_ENV === 'development'

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {showPerfMetrics && (
        <PerformanceMetrics loading={loading} fetchTime={fetchTime} />
      )}
      
      <div className="py-6">
        {/* Welcome Header with calming design - mobile optimized */}
        <div className="mb-6 lg:mb-10">
          <div className="text-center max-w-2xl mx-auto px-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-warm-gray-800 mb-2 lg:mb-3 tracking-tight">
              Good {mounted && new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
            </h1>
            <p className="text-base lg:text-lg text-warm-gray-600 leading-relaxed">
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

        {/* Stats Cards with calming colors and soft shadows - Mobile optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-soft border border-sage-100 hover:shadow-soft-hover transition-all duration-300">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="p-2 lg:p-3 bg-sage-100 rounded-lg lg:rounded-xl">
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-sage-600" />
              </div>
              <div>
                <div className="text-xs lg:text-sm font-medium text-warm-gray-500 mb-1">Study Courses</div>
                <div className="text-xl lg:text-2xl font-heading font-semibold text-warm-gray-800">
                  {courses?.length || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-soft border border-lavender-100 hover:shadow-soft-hover transition-all duration-300">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="p-2 lg:p-3 bg-lavender-100 rounded-lg lg:rounded-xl">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-lavender-500" />
              </div>
              <div>
                <div className="text-xs lg:text-sm font-medium text-warm-gray-500 mb-1">Due Soon</div>
                <div className="text-xl lg:text-2xl font-heading font-semibold text-warm-gray-800">
                  {mounted ? (upcomingAssignments?.length || 0) : 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-soft border border-soft-blue-100 hover:shadow-soft-hover transition-all duration-300">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="p-2 lg:p-3 bg-soft-blue-100 rounded-lg lg:rounded-xl">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-soft-blue-500" />
              </div>
              <div>
                <div className="text-xs lg:text-sm font-medium text-warm-gray-500 mb-1">Completed</div>
                <div className="text-xl lg:text-2xl font-heading font-semibold text-warm-gray-800">
                  {completedAssignments}/{totalAssignments}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-soft border border-cream-200 hover:shadow-soft-hover transition-all duration-300">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="p-2 lg:p-3 bg-cream-200 rounded-lg lg:rounded-xl">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-warm-gray-600" />
              </div>
              <div>
                <div className="text-xs lg:text-sm font-medium text-warm-gray-500 mb-1">Average Grade</div>
                <div className="text-xl lg:text-2xl font-heading font-semibold text-warm-gray-800">
                  {averageGrade ? `${averageGrade.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upcoming Assignments with journal-like design - Mobile optimized */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-soft border border-sage-100">
            <div className="p-4 lg:p-6 border-b border-sage-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-heading font-semibold text-warm-gray-800">
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
            <div className="p-4 lg:p-6">
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
                    <div key={assignment.id}>
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

          {/* Grade Progress with calm design - Mobile optimized */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-soft border border-lavender-100">
            <div className="p-4 lg:p-6 border-b border-lavender-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-heading font-semibold text-warm-gray-800">
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
            <div className="p-4 lg:p-6">
              <GradeChart grades={grades} />
            </div>
          </div>
        </div>

        {/* Study Reminders with gentle personal assistant vibe */}
        <div className="mt-8 lg:mt-12">
          <UpcomingReminders />
        </div>

        {/* Analytics Integration - Study Consistency Heatmap */}
        <div className="mt-8 lg:mt-12">
          <StudyConsistencyHeatmap assignments={assignments || []} />
        </div>

        {/* Quick Analytics Preview */}
        <div className="mt-8 lg:mt-12">
          <Card className="bg-white/80 backdrop-blur-sm border-lavender-100 shadow-soft hover:shadow-soft-hover transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-lavender-600" />
                  <CardTitle className="font-heading text-warm-gray-800">Analytics Preview</CardTitle>
                </div>
                <a 
                  href="/dashboard/analytics"
                  className="text-sm text-lavender-500 hover:text-lavender-600 font-medium px-3 py-1 rounded-lg hover:bg-lavender-50 transition-all duration-200"
                >
                  View full analytics →
                </a>
              </div>
              <CardDescription className="text-warm-gray-600">
                Quick insights into your study patterns and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-sage-50 rounded-xl">
                  <div className="text-lg font-semibold text-sage-600">
                    {mounted ? Math.round(((assignments?.filter((a: CanvasAssignment) => a.submission?.submitted_at).length || 0) / Math.max(assignments?.length || 1, 1)) * 100) : 0}%
                  </div>
                  <div className="text-xs text-sage-700">Completion Rate</div>
                </div>
                <div className="text-center p-3 bg-lavender-50 rounded-xl">
                  <div className="text-lg font-semibold text-lavender-600">
                    {averageGrade ? `${averageGrade.toFixed(0)}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-lavender-700">Avg Grade</div>
                </div>
                <div className="text-center p-3 bg-peach-50 rounded-xl">
                  <div className="text-lg font-semibold text-peach-600">
                    {mounted ? (upcomingAssignments?.length || 0) : 0}
                  </div>
                  <div className="text-xs text-peach-700">Due Soon</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-lg font-semibold text-blue-600">
                    {courses?.length || 0}
                  </div>
                  <div className="text-xs text-blue-700">Active Courses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button - Mobile optimized */}
        <FloatingActionButton
          onSync={handleSyncAction}
          onAddReminder={handleAddReminder}
          onAddSchedule={handleAddSchedule}
        />
      </div>
    </PullToRefresh>
  )
}
