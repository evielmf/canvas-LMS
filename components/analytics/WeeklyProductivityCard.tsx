'use client'

import { TrendingUp, Calendar, CheckCircle, Clock } from 'lucide-react'
import type { WeeklyProductivity } from '@/hooks/useAnalyticsData'

interface WeeklyProductivityCardProps {
  productivity?: WeeklyProductivity
  totalCourses: number
}

export default function WeeklyProductivityCard({ 
  productivity, 
  totalCourses 
}: WeeklyProductivityCardProps) {
  if (!productivity) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="animate-soft-pulse">
          <div className="h-6 bg-sage-100 rounded mb-4"></div>
          <div className="h-20 bg-sage-50 rounded"></div>
        </div>
      </div>
    )
  }

  const { assignmentsDue, assignmentsCompleted, completionRate } = productivity

  // Generate motivational message based on completion rate
  const getMotivationalMessage = () => {
    if (completionRate >= 90) return "🔥 Outstanding work! You're crushing it!"
    if (completionRate >= 75) return "💪 Great job! You're staying on top of things!"
    if (completionRate >= 50) return "📚 Good progress! Keep pushing forward!"
    if (completionRate >= 25) return "⚡ You've got this! Time to catch up!"
    return "🌱 Fresh start! Let's build momentum together!"
  }

  const getCompletionColor = () => {
    if (completionRate >= 75) return 'text-green-600 bg-green-100'
    if (completionRate >= 50) return 'text-blue-600 bg-blue-100'
    if (completionRate >= 25) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 text-sage-600 mr-2" />
            Weekly Productivity
          </h2>
          <p className="text-sm text-warm-gray-600 mt-1">
            This week's assignment completion progress
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-warm-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Current Week</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-sage-50 rounded-xl">
          <div className="text-2xl lg:text-3xl font-bold text-sage-600">
            {assignmentsDue}
          </div>
          <div className="text-xs lg:text-sm text-sage-700 font-medium">
            Due This Week
          </div>
        </div>

        <div className="text-center p-4 bg-lavender-50 rounded-xl">
          <div className="text-2xl lg:text-3xl font-bold text-lavender-600">
            {assignmentsCompleted}
          </div>
          <div className="text-xs lg:text-sm text-lavender-700 font-medium">
            Completed
          </div>
        </div>

        <div className="text-center p-4 bg-peach-50 rounded-xl">
          <div className={`text-2xl lg:text-3xl font-bold ${getCompletionColor().split(' ')[0]}`}>
            {completionRate}%
          </div>
          <div className="text-xs lg:text-sm text-peach-700 font-medium">
            Completion Rate
          </div>
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <div className="text-2xl lg:text-3xl font-bold text-blue-600">
            {totalCourses}
          </div>
          <div className="text-xs lg:text-sm text-blue-700 font-medium">
            Active Courses
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-warm-gray-700">
            Progress
          </span>
          <span className="text-sm text-warm-gray-600">
            {assignmentsCompleted} of {assignmentsDue}
          </span>
        </div>
        <div className="w-full bg-warm-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              completionRate >= 75 ? 'bg-green-500' :
              completionRate >= 50 ? 'bg-blue-500' :
              completionRate >= 25 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.max(completionRate, 2)}%` }}
          />
        </div>
      </div>

      {/* Motivational Message */}
      <div className={`p-4 rounded-xl ${getCompletionColor()}`}>
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="font-medium">
            {getMotivationalMessage()}
          </p>
        </div>
      </div>
    </div>
  )
}
