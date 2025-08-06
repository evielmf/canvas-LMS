'use client'

import { Award, BookOpen, TrendingUp, AlertCircle, Heart, CheckCircle, AlertTriangle, GraduationCap, Target, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { CourseHealth } from '@/hooks/useAnalyticsData'

interface CourseHealthGridProps {
  courseHealth: CourseHealth[]
  loading?: boolean
}

export default function CourseHealthGrid({ courseHealth, loading }: CourseHealthGridProps) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Course Health</CardTitle>
          </div>
          <CardDescription>Monitor your performance across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-sage-50 rounded-xl animate-soft-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!courseHealth || courseHealth.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Course Health</CardTitle>
          </div>
          <CardDescription>Monitor your performance across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-warm-gray-300 mx-auto mb-3" />
            <p className="text-warm-gray-600">No course data available yet</p>
          </div>
        </CardContent>
      </Card>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {courseHealth.map((course, index) => (
          <div 
            key={course.courseId || `course-${index}`}
            className="border border-warm-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white overflow-hidden relative min-h-[280px]"
          >
            {/* Course Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-semibold text-warm-gray-800 text-sm leading-tight mb-1 break-words">
                    {course.courseName.length > 25 ? `${course.courseName.substring(0, 25)}...` : course.courseName}
                  </h3>
                  <p className="text-xs text-warm-gray-600 break-words">
                    {course.courseCode}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border shrink-0 ${getHealthBadgeStyle(course.healthScore)}`}>
                  {course.healthScore}/100
                </div>
              </div>
            </div>

            {/* Health Score Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-warm-gray-700">
                  Health Score
                </span>
                <span className="text-xs text-warm-gray-600">
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
            <div className="space-y-3 mb-4">
              {/* Average Grade */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sage-50 to-sage-100 rounded-lg border border-sage-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4 text-sage-600" />
                  <span className="text-sm font-medium text-sage-700">Avg Grade</span>
                </div>
                <div className="text-xl font-bold text-sage-600">
                  {course.averageGrade}%
                </div>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lavender-50 to-lavender-100 rounded-lg border border-lavender-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  <Target className="w-4 h-4 text-lavender-600" />
                  <span className="text-sm font-medium text-lavender-700">Completed</span>
                </div>
                <div className="text-xl font-bold text-lavender-600">
                  {course.completionRate}%
                </div>
              </div>

              {/* Assignments */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-peach-50 to-peach-100 rounded-lg border border-peach-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-peach-600" />
                  <span className="text-sm font-medium text-peach-700">Assignments</span>
                </div>
                <div className="text-xl font-bold text-peach-600">
                  {course.completedAssignments}/{course.totalAssignments}
                </div>
              </div>
            </div>

            {/* Warning for low health scores */}
            {course.healthScore < 40 && (
              <div className="flex items-start p-3 bg-red-50 rounded-lg border-l-4 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-tight break-words">
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
