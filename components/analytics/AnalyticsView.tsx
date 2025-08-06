'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  Calendar,
  Target,
  Award,
  Clock,
  Activity,
  RefreshCw
} from 'lucide-react'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { useCanvasData } from '@/hooks/useCanvasData'
import WeeklyProductivityCard from '@/components/analytics/WeeklyProductivityCard'
import CourseHealthGrid from '@/components/analytics/CourseHealthGrid'
import GradeTrendsChart from '@/components/analytics/GradeTrendsChart'
import TimeAllocationBreakdown from '@/components/analytics/TimeAllocationBreakdown'
import SmartPatternInsights from '@/components/analytics/SmartPatternInsights'
import StudyConsistencyHeatmap from '@/components/analytics/StudyConsistencyHeatmap'
import PullToRefresh from '@/components/ui/PullToRefresh'
import { toast } from 'react-hot-toast'

export default function AnalyticsView() {
  const [mounted, setMounted] = useState(false)
  const { 
    weeklyProductivity,
    courseHealth,
    gradeTrends,
    gradeDistribution,
    totalGradedAssignments,
    studySessions,
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useAnalyticsData()
  
  const { 
    assignments, 
    courses, 
    grades, 
    loading: canvasLoading,
    refetch: refetchCanvas
  } = useCanvasData()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = async () => {
    await Promise.all([refetchAnalytics(), refetchCanvas()])
    toast.success('Analytics refreshed! 📊')
  }

  const loading = analyticsLoading || canvasLoading

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-soft-pulse text-center">
          <BarChart3 className="h-12 w-12 text-sage-500 mx-auto mb-4" />
          <p className="text-warm-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Show empty state if no Canvas data
  if (!loading && (!assignments || assignments.length === 0)) {
    return (
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-warm-gray-800 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-warm-gray-600">
            Insights into your academic performance and study habits
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="p-8 bg-sage-50 rounded-2xl max-w-md">
            <BarChart3 className="h-16 w-16 text-sage-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warm-gray-800 mb-2">
              No Data Available Yet
            </h3>
            <p className="text-warm-gray-600 mb-4">
              Connect your Canvas account and complete some assignments to see your analytics insights.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-warm-gray-800 mb-2">
                📊 Analytics Dashboard
              </h1>
              <p className="text-warm-gray-600">
                Insights into your academic performance and study habits
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="hidden lg:flex items-center px-4 py-2 bg-sage-100 text-sage-700 rounded-xl hover:bg-sage-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-sage-50 rounded-2xl animate-soft-pulse" />
            ))}
          </div>
        )}

        {/* Analytics Content */}
        {!loading && (
          <div className="space-y-8">
            {/* Study Consistency Heatmap - New Addition */}
            <StudyConsistencyHeatmap assignments={assignments || []} />

            {/* Weekly Productivity */}
            <WeeklyProductivityCard 
              productivity={weeklyProductivity}
              totalCourses={courses?.length || 0}
            />

            {/* Two-column layout for larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Health Grid */}
              <CourseHealthGrid 
                courseHealth={courseHealth || []}
                loading={loading}
              />

              {/* Time Allocation Breakdown */}
              <TimeAllocationBreakdown 
                sessions={studySessions}
                loading={loading}
                courses={courses?.filter(c => c.id).map(c => ({ id: c.id.toString(), name: c.name })) || []}
                onRefresh={refetchAnalytics}
              />
            </div>

            {/* Grade Trends */}
            <GradeTrendsChart 
              trends={gradeTrends || []}
              distribution={gradeDistribution}
              totalGradedAssignments={totalGradedAssignments || 0}
            />

            {/* Two-column layout for insights */}
            {/* Smart Pattern Insights */}
            <SmartPatternInsights 
              assignments={assignments || []}
              sessions={studySessions}
              loading={loading}
            />
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-lavender-50 rounded-xl">
                <div className="text-2xl font-bold text-lavender-600">
                  {courses?.length || 0}
                </div>
                <div className="text-sm text-lavender-700">Active Courses</div>
              </div>
              
              <div className="text-center p-4 bg-sage-50 rounded-xl">
                <div className="text-2xl font-bold text-sage-600">
                  {assignments?.length || 0}
                </div>
                <div className="text-sm text-sage-700">Total Assignments</div>
              </div>
              
              <div className="text-center p-4 bg-peach-50 rounded-xl">
                <div className="text-2xl font-bold text-peach-600">
                  {totalGradedAssignments || 0}
                </div>
                <div className="text-sm text-peach-700">Graded Items</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyProductivity?.completionRate || 0}%
                </div>
                <div className="text-sm text-blue-700">Week Completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {analyticsError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
                <p className="text-red-600 text-sm mt-1">
                  Unable to load analytics data. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  )
}
