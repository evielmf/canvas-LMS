'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Clock, Play } from 'lucide-react'
import StudySessionModal from './StudySessionModal'

interface StudySession {
  id: string
  course_id?: string
  course_name?: string
  duration_minutes: number
  activity_type: string
  started_at: string
  completed_at?: string
}

interface TimeAllocationData {
  courseName: string
  totalMinutes: number
  sessionCount: number
  color: string
}

interface TimeAllocationBreakdownProps {
  sessions?: StudySession[]
  loading?: boolean
  courses?: Array<{ id: string; name: string }>
  onRefresh?: () => void
}

export default function TimeAllocationBreakdown({ 
  sessions, 
  loading, 
  courses = [],
  onRefresh 
}: TimeAllocationBreakdownProps) {
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="animate-soft-pulse">
          <div className="h-6 bg-sage-100 rounded mb-4"></div>
          <div className="h-64 bg-sage-50 rounded"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="animate-soft-pulse">
          <div className="h-6 bg-sage-100 rounded mb-4"></div>
          <div className="h-64 bg-sage-50 rounded"></div>
        </div>
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center mb-4">
          <Clock className="h-5 w-5 text-sage-600 mr-2" />
          Time Allocation
        </h2>
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-warm-gray-300 mx-auto mb-3" />
          <p className="text-warm-gray-600">No study sessions recorded yet</p>
          <p className="text-sm text-warm-gray-500 mt-1">
            Start tracking your study time to see allocation insights
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors inline-flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Study Session
          </button>
        </div>
      </div>
    )
  }

  // Process sessions data
  const courseTimeMap = new Map<string, { totalMinutes: number, sessionCount: number }>()

  sessions.forEach(session => {
    const courseName = session.course_name || 'General Study'
    const current = courseTimeMap.get(courseName) || { totalMinutes: 0, sessionCount: 0 }
    
    courseTimeMap.set(courseName, {
      totalMinutes: current.totalMinutes + session.duration_minutes,
      sessionCount: current.sessionCount + 1
    })
  })

  // Convert hex colors to Tailwind classes
  const getColorClass = (color: string) => {
    const colorMap: {[key: string]: string} = {
      '#3B82F6': 'bg-blue-500',
      '#10B981': 'bg-emerald-500',
      '#F59E0B': 'bg-amber-500',
      '#EF4444': 'bg-red-500',
      '#8B5CF6': 'bg-violet-500',
      '#06B6D4': 'bg-cyan-500',
      '#84CC16': 'bg-lime-500',
      '#F97316': 'bg-orange-500',
      '#EC4899': 'bg-pink-500',
      '#6366F1': 'bg-indigo-500'
    }
    return colorMap[color] || 'bg-gray-500'
  }

  // Convert to chart data with colors
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  const timeAllocationData: TimeAllocationData[] = Array.from(courseTimeMap.entries())
    .map(([courseName, data], index) => ({
      courseName,
      totalMinutes: data.totalMinutes,
      sessionCount: data.sessionCount,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)

  const totalStudyTime = timeAllocationData.reduce((sum, item) => sum + item.totalMinutes, 0)
  const totalSessions = timeAllocationData.reduce((sum, item) => sum + item.sessionCount, 0)

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.totalMinutes / totalStudyTime) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border border-warm-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-warm-gray-800">{data.courseName}</p>
          <p className="text-sm text-warm-gray-600">
            {formatTime(data.totalMinutes)} ({percentage}%)
          </p>
          <p className="text-xs text-warm-gray-500">
            {data.sessionCount} session{data.sessionCount !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <Clock className="h-5 w-5 text-sage-600 mr-2" />
            Time Allocation
          </h2>
          <p className="text-sm text-warm-gray-600 mt-1">
            Study time breakdown by course
          </p>
        </div>
        <div className="text-xs text-warm-gray-500 text-right">
          <div>{formatTime(totalStudyTime)} total</div>
          <div>{totalSessions} sessions</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-sage-50 rounded-xl">
          <div className="text-xl font-bold text-sage-600">
            {formatTime(totalStudyTime)}
          </div>
          <div className="text-sm text-sage-700">Total Study Time</div>
        </div>
        
        <div className="text-center p-3 bg-lavender-50 rounded-xl">
          <div className="text-xl font-bold text-lavender-600">
            {totalSessions}
          </div>
          <div className="text-sm text-lavender-700">Study Sessions</div>
        </div>
        
        <div className="text-center p-3 bg-peach-50 rounded-xl">
          <div className="text-xl font-bold text-peach-600">
            {totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0}m
          </div>
          <div className="text-sm text-peach-700">Avg Session</div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-64 lg:h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={timeAllocationData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={100}
              paddingAngle={2}
              dataKey="totalMinutes"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {timeAllocationData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={activeIndex === index ? '#374151' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {timeAllocationData.map((course, index) => {
          const percentage = ((course.totalMinutes / totalStudyTime) * 100)
          return (
            <div key={course.courseName} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${getColorClass(course.color)}`}
                />
                <div>
                  <p className="font-medium text-warm-gray-800 text-sm">
                    {course.courseName}
                  </p>
                  <p className="text-xs text-warm-gray-500">
                    {course.sessionCount} session{course.sessionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-warm-gray-800 text-sm">
                  {formatTime(course.totalMinutes)}
                </p>
                <p className="text-xs text-warm-gray-500">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Study Session Tracker */}
      <div className="mt-6 pt-6 border-t border-warm-gray-100">
        <div className="bg-gradient-to-r from-sage-50 to-lavender-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-warm-gray-800 mb-1">
                ⏱️ Track Study Session
              </h4>
              <p className="text-sm text-warm-gray-600">
                Log your study time to improve insights
              </p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors inline-flex items-center text-sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </button>
          </div>
        </div>
      </div>

      {/* Study Session Modal */}
      <StudySessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        courses={courses}
        onSessionSaved={() => {
          onRefresh?.()
        }}
      />
    </div>
  )
}
