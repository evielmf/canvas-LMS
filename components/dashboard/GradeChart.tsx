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
      <div className="flex items-center justify-center h-48 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No grade data available</p>
          <p className="text-sm">Connect your Canvas account to see your progress</p>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
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
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {averageGrade.toFixed(1)}%
          </div>
          <div className="text-sm text-blue-800">Average Grade</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {grades.length}
          </div>
          <div className="text-sm text-green-800">Graded Items</div>
        </div>
      </div>

      {/* Grade Trend Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
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
              stroke="#0374B5" 
              strokeWidth={2}
              dot={{ fill: '#0374B5', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Grades */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Grades</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {chartData.slice(-5).reverse().map((grade, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-900">{grade.fullName}</p>
                <p className="text-xs text-gray-500">{grade.course}</p>
              </div>
              <div className="ml-4 text-right">
                <div className={`font-medium ${
                  grade.percentage >= 90 ? 'text-green-600' :
                  grade.percentage >= 80 ? 'text-blue-600' :
                  grade.percentage >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {grade.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {grade.score}/{grade.possible}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
