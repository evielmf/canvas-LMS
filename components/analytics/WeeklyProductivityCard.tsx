'use client'

import { TrendingUp, Calendar, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
      <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Weekly Productivity</CardTitle>
          </div>
          <CardDescription>Track your weekly assignment completion progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-soft-pulse space-y-4">
            <div className="h-4 bg-sage-100 rounded w-full"></div>
            <div className="h-20 bg-sage-50 rounded"></div>
          </div>
        </CardContent>
      </Card>
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
    <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft hover:shadow-soft-hover transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Weekly Productivity</CardTitle>
          </div>
          <Badge variant="outline" className="border-sage-200 text-sage-700">
            <Calendar className="h-3 w-3 mr-1" />
            Current Week
          </Badge>
        </div>
        <CardDescription className="text-warm-gray-600">
          This week's assignment completion progress • {completionRate}% complete
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
          <Progress 
            value={completionRate} 
            className="h-3"
            // Custom styling based on completion rate
          />
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
      </CardContent>
    </Card>
  )
}
