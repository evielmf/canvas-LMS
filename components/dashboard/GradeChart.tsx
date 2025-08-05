'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { CanvasGrade } from '@/hooks/useCanvasData'

interface GradeChartProps {
  grades?: CanvasGrade[]
}

export default function GradeChart({ grades }: GradeChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!grades || grades.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 lg:h-48 text-warm-gray-500">
        <div className="text-center">
          <div className="text-3xl lg:text-4xl mb-2">📊</div>
          <p className="text-sm lg:text-base font-medium text-warm-gray-600">No grade data available</p>
          <p className="text-xs lg:text-sm text-warm-gray-500 mt-1">Connect your Canvas account to see your progress</p>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-32 lg:h-48 text-warm-gray-500">
        <div className="text-center">
          <div className="animate-soft-pulse">
            <div className="h-4 bg-sage-200 rounded w-32 mb-2 mx-auto"></div>
            <div className="h-3 bg-sage-200 rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  // Process grades for chart display
  const chartData = grades
    .map(grade => ({
      name: grade.assignment_name.length > 20 
        ? grade.assignment_name.substring(0, 20) + '...' 
        : grade.assignment_name,
      fullName: grade.assignment_name,
      score: grade.score,
      possible: grade.points_possible,
      percentage: grade.points_possible > 0 ? (grade.score / grade.points_possible) * 100 : 0,
      course: grade.course_name,
      date: grade.graded_at,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10) // Show last 10 grades

  const averageGrade = chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length

  return (
    <div className="space-y-4">
      {/* Summary Stats - Mobile optimized */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4">
        <div className="text-center p-3 bg-sage-50 rounded-xl">
          <div className="text-xl lg:text-2xl font-heading font-semibold text-sage-600">
            {averageGrade.toFixed(1)}%
          </div>
          <div className="text-xs lg:text-sm text-sage-700 font-medium">Average Grade</div>
        </div>
        <div className="text-center p-3 bg-lavender-50 rounded-xl">
          <div className="text-xl lg:text-2xl font-heading font-semibold text-lavender-500">
            {grades.length}
          </div>
          <div className="text-xs lg:text-sm text-lavender-600 font-medium">Graded Items</div>
        </div>
      </div>

      {/* Mobile: Simple Progress Bars, Desktop: Line Chart */}
      <div className="lg:hidden">
        <h3 className="text-sm font-medium text-warm-gray-800 mb-3">Recent Grades</h3>
        <div className="space-y-3">
          {chartData.slice(-5).reverse().map((grade, index) => (
            <div key={index} className="bg-sage-25 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-gray-800 line-clamp-1">{grade.fullName}</p>
                  <p className="text-xs text-warm-gray-600">{grade.course}</p>
                </div>
                <div className="text-right ml-3">
                  <div className={`text-sm font-semibold ${
                    grade.percentage >= 90 ? 'text-green-600' :
                    grade.percentage >= 80 ? 'text-sage-600' :
                    grade.percentage >= 70 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {grade.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-warm-gray-500">
                    {grade.score}/{grade.possible}
                  </div>
                </div>
              </div>
              {/* Simple progress bar */}
              <div className="w-full bg-warm-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    grade.percentage >= 90 ? 'bg-green-500' :
                    grade.percentage >= 80 ? 'bg-sage-500' :
                    grade.percentage >= 70 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(grade.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Full Line Chart */}
      <div className="hidden lg:block">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(226, 235, 227)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'rgb(120, 113, 108)' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: 'rgb(120, 113, 108)' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid rgb(226, 235, 227)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(87, 83, 78, 0.12)',
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  'Grade'
                ]}
                labelFormatter={(label: any, payload: any) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullName
                  }
                  return label
                }}
              />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="rgb(76, 130, 86)" 
                strokeWidth={3}
                dot={{ fill: 'rgb(76, 130, 86)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'rgb(107, 161, 115)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Desktop Recent Grades */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-warm-gray-800 mb-3">Recent Grades</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {chartData.slice(-5).reverse().map((grade, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-sage-25 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-warm-gray-800 font-medium">{grade.fullName}</p>
                  <p className="text-xs text-warm-gray-600">{grade.course}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className={`font-semibold ${
                    grade.percentage >= 90 ? 'text-green-600' :
                    grade.percentage >= 80 ? 'text-sage-600' :
                    grade.percentage >= 70 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {grade.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-warm-gray-500">
                    {grade.score}/{grade.possible}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
