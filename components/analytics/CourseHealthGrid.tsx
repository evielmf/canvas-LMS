'use client'

import { Award, BookOpen, TrendingUp, AlertCircle } from 'lucide-react'
import type { CourseHealth } from '@/hooks/useAnalyticsData'

interface CourseHealthGridProps {
  courseHealth: CourseHealth[]
  loading?: boolean
}

export default function CourseHealthGrid({ courseHealth, loading }: CourseHealthGridProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="animate-soft-pulse">
          <div className="h-6 bg-sage-100 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-sage-50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!courseHealth || courseHealth.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center mb-4">
          <Award className="h-5 w-5 text-sage-600 mr-2" />
          Course Health Scores
        </h2>
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-warm-gray-300 mx-auto mb-3" />
          <p className="text-warm-gray-600">No course data available yet</p>
        </div>
      </div>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getHealthBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getHealthMessage = (score: number) => {
    if (score >= 80) return 'Excellent!'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Attention'
    return 'Critical'
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <Award className="h-5 w-5 text-sage-600 mr-2" />
            Course Health Scores
          </h2>
          <p className="text-sm text-warm-gray-600 mt-1">
            Performance overview across all your courses
          </p>
        </div>
        <div className="text-xs text-warm-gray-500 text-right">
          <div>Based on grades,</div>
          <div>completion & engagement</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courseHealth.map((course) => (
          <div 
            key={course.courseId}
            className="border border-warm-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            {/* Course Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-warm-gray-800 truncate">
                  {course.courseName}
                </h3>
                <p className="text-sm text-warm-gray-600">
                  {course.courseCode}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getHealthBadgeStyle(course.healthScore)}`}>
                {course.healthScore}/100
              </div>
            </div>

            {/* Health Score Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-warm-gray-700">
                  Health Score
                </span>
                <span className="text-sm text-warm-gray-600">
                  {getHealthMessage(course.healthScore)}
                </span>
              </div>
              <div className="w-full bg-warm-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getHealthColor(course.healthScore)}`}
                  style={{ width: `${Math.max(course.healthScore, 2)}%` }}
                />
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-sage-50 rounded-lg p-2">
                <div className="text-sm font-semibold text-sage-600">
                  {course.averageGrade}%
                </div>
                <div className="text-xs text-sage-700">Avg Grade</div>
              </div>
              
              <div className="bg-lavender-50 rounded-lg p-2">
                <div className="text-sm font-semibold text-lavender-600">
                  {course.completionRate}%
                </div>
                <div className="text-xs text-lavender-700">Completed</div>
              </div>
              
              <div className="bg-peach-50 rounded-lg p-2">
                <div className="text-sm font-semibold text-peach-600">
                  {course.completedAssignments}/{course.totalAssignments}
                </div>
                <div className="text-xs text-peach-700">Assignments</div>
              </div>
            </div>

            {/* Warning for low health scores */}
            {course.healthScore < 40 && (
              <div className="mt-3 flex items-center p-2 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  This course needs immediate attention
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-warm-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-warm-gray-800">
              {courseHealth.filter(c => c.healthScore >= 80).length}
            </div>
            <div className="text-sm text-green-600">Excellent</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warm-gray-800">
              {courseHealth.filter(c => c.healthScore >= 60 && c.healthScore < 80).length}
            </div>
            <div className="text-sm text-blue-600">Good</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warm-gray-800">
              {courseHealth.filter(c => c.healthScore < 60).length}
            </div>
            <div className="text-sm text-red-600">Needs Work</div>
          </div>
        </div>
      </div>
    </div>
  )
}
