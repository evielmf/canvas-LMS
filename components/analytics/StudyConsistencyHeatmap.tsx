'use client'

import { useState, useEffect } from 'react'
import { Calendar, Activity, Flame, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CanvasAssignment } from '@/hooks/useCanvasDataCached'

interface StudyConsistencyHeatmapProps {
  assignments: CanvasAssignment[]
}

interface HeatmapDay {
  date: string
  activity: number
  assignments: string[]
  dayOfWeek: number
  dayOfMonth: number
}

export default function StudyConsistencyHeatmap({ assignments }: StudyConsistencyHeatmapProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Study Consistency</CardTitle>
          </div>
          <CardDescription>GitHub-style heatmap of your assignment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-soft-pulse space-y-4">
            <div className="h-4 bg-sage-100 rounded w-full"></div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 84 }).map((_, i) => (
                <div key={i} className="h-3 w-3 bg-sage-100 rounded-sm"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate last 12 weeks of data
  const generateHeatmapData = (): HeatmapDay[] => {
    const days: HeatmapDay[] = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (12 * 7)) // 12 weeks ago

    // Create activity map from assignments
    const activityMap = new Map<string, { count: number, assignments: string[] }>()

    assignments.forEach(assignment => {
      if (assignment.submission?.submitted_at) {
        const submissionDate = new Date(assignment.submission.submitted_at)
        const dateKey = submissionDate.toISOString().split('T')[0]
        
        if (!activityMap.has(dateKey)) {
          activityMap.set(dateKey, { count: 0, assignments: [] })
        }
        
        const current = activityMap.get(dateKey)!
        current.count += 1
        current.assignments.push(assignment.name)
      }
    })

    // Generate 84 days (12 weeks)
    for (let i = 0; i < 84; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const dateKey = currentDate.toISOString().split('T')[0]
      const activity = activityMap.get(dateKey)
      
      days.push({
        date: dateKey,
        activity: activity ? activity.count : 0,
        assignments: activity ? activity.assignments : [],
        dayOfWeek: currentDate.getDay(),
        dayOfMonth: currentDate.getDate()
      })
    }

    return days
  }

  const heatmapData = generateHeatmapData()
  
  // Calculate max activity for scaling
  const maxActivity = Math.max(...heatmapData.map(d => d.activity), 1)

  // Get activity intensity (0-4 scale like GitHub)
  const getActivityIntensity = (activity: number): number => {
    if (activity === 0) return 0
    if (activity === 1) return 1
    if (activity <= 2) return 2
    if (activity <= 4) return 3
    return 4
  }

  // Get color class based on intensity
  const getActivityColor = (intensity: number): string => {
    const colors = [
      'bg-warm-gray-100', // 0 - no activity
      'bg-sage-200',      // 1 - low activity
      'bg-sage-400',      // 2 - medium activity
      'bg-sage-600',      // 3 - high activity
      'bg-sage-800',      // 4 - very high activity
    ]
    return colors[intensity] || colors[0]
  }

  // Calculate total activity and streaks
  const totalActivity = heatmapData.reduce((sum, day) => sum + day.activity, 0)
  const activeDays = heatmapData.filter(day => day.activity > 0).length
  
  // Calculate current streak
  let currentStreak = 0
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].activity > 0) {
      currentStreak++
    } else {
      break
    }
  }

  // Group days by week
  const weeks: HeatmapDay[][] = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7))
  }

  // Day labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft hover:shadow-soft-hover transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Study Consistency</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-sage-100 text-sage-700 border-sage-200">
              <Flame className="h-3 w-3 mr-1" />
              {currentStreak} day streak
            </Badge>
          </div>
        </div>
        <CardDescription className="text-warm-gray-600">
          GitHub-style heatmap showing your assignment submission patterns • {activeDays} active days
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <Activity className="h-5 w-5 text-sage-600 mr-2" />
            Study Consistency
          </h2>
          <p className="text-sm text-warm-gray-600 mt-1">
            GitHub-style heatmap of your assignment submissions
          </p>
        </div>
        <div className="text-xs text-warm-gray-500 text-right">
          <div>Last 12 weeks</div>
          <div className="font-medium">{totalActivity} submissions</div>
        </div>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-sage-50 rounded-xl">
            <div className="text-xl font-bold text-sage-600">{totalActivity}</div>
            <div className="text-sm text-sage-700">Total Submissions</div>
          </div>
          
          <div className="text-center p-3 bg-lavender-50 rounded-xl">
            <div className="text-xl font-bold text-lavender-600">{activeDays}</div>
            <div className="text-sm text-lavender-700">Active Days</div>
          </div>
          
          <div className="text-center p-3 bg-peach-50 rounded-xl">
            <div className="text-xl font-bold text-peach-600">{currentStreak}</div>
            <div className="text-sm text-peach-700">Current Streak</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="mb-4">
          <div className="flex flex-col space-y-1">
            {/* Day labels */}
            <div className="flex">
              <div className="w-8"></div> {/* Spacer for day labels */}
              <div className="flex space-x-1">
                {dayLabels.map((day, index) => (
                  <div key={index} className="w-3 h-3 text-xs text-warm-gray-500 flex items-center justify-center">
                    {day[0]}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Heatmap grid */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex">
                <div className="w-8 text-xs text-warm-gray-500 flex items-center">
                  {weekIndex % 4 === 0 && (
                    <span>
                      {new Date(week[0]?.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  {week.map((day, dayIndex) => {
                    const intensity = getActivityIntensity(day.activity)
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-sage-300 ${getActivityColor(intensity)}`}
                        title={`${day.date}: ${day.activity} submissions${day.assignments.length > 0 ? '\n' + day.assignments.join(', ') : ''}`}
                        onClick={() => setSelectedDay(day)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-warm-gray-600">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>

        {/* Selected Day Details */}
        {selectedDay && selectedDay.activity > 0 && (
          <div className="mt-6 p-4 bg-sage-50 rounded-xl">
            <h4 className="font-medium text-warm-gray-800 mb-2">
              📅 {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <p className="text-sm text-warm-gray-600 mb-2">
              {selectedDay.activity} assignment{selectedDay.activity > 1 ? 's' : ''} submitted
            </p>
            <div className="space-y-1">
              {selectedDay.assignments.map((assignment, index) => (
                <div key={index} className="text-sm text-sage-700 bg-white px-2 py-1 rounded">
                  • {assignment}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern Insights */}
        {heatmapData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-warm-gray-100">
            <div className="bg-lavender-50 rounded-xl p-4">
              <h4 className="font-medium text-warm-gray-800 mb-2">🧠 Pattern Insights</h4>
              <p className="text-sm text-warm-gray-600">
                {(() => {
                  // Analyze patterns
                  const dayActivityMap = new Map<number, number>()
                  heatmapData.forEach(day => {
                    const dayOfWeek = day.dayOfWeek
                    dayActivityMap.set(dayOfWeek, (dayActivityMap.get(dayOfWeek) || 0) + day.activity)
                  })
                  
                  const entries = Array.from(dayActivityMap.entries())
                  const mostActiveDay = entries
                    .sort((a, b) => b[1] - a[1])[0]
                  
                  const leastActiveDay = entries
                    .filter(([_, activity]) => activity > 0)
                    .sort((a, b) => a[1] - b[1])[0]

                  if (!mostActiveDay) {
                    return "Start building your submission consistency! 🌱"
                  }

                  const dayName = dayLabels[mostActiveDay[0]]
                  const insights = [
                    `You're most productive on ${dayName}s! 🔥`,
                    currentStreak > 7 ? `Amazing ${currentStreak}-day streak! Keep it up! ⚡` : null,
                    activeDays > 30 ? "Great consistency over the past weeks! 📈" : null,
                    leastActiveDay && leastActiveDay[0] !== mostActiveDay[0] ? 
                      `Consider scheduling more work on ${dayLabels[leastActiveDay[0]]}s` : null
                  ].filter(Boolean)

                  return insights[Math.floor(Math.random() * insights.length)] || 
                         "Keep building your study consistency! 💪"
                })()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
