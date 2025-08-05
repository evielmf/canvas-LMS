'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import type { GradeTrend, GradeDistribution } from '@/hooks/useAnalyticsData'

interface GradeTrendsChartProps {
  trends: GradeTrend[]
  distribution?: GradeDistribution
  totalGradedAssignments: number
}

export default function GradeTrendsChart({ 
  trends, 
  distribution, 
  totalGradedAssignments 
}: GradeTrendsChartProps) {
  const [mounted, setMounted] = useState(false)
  const [activeChart, setActiveChart] = useState<'trends' | 'distribution'>('trends')

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

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-sage-600 mr-2" />
          Grade Trends
        </h2>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-warm-gray-300 mx-auto mb-3" />
          <p className="text-warm-gray-600">No grade data available yet</p>
          <p className="text-sm text-warm-gray-500 mt-1">
            Complete some assignments to see your grade trends
          </p>
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const trendsData = trends.slice(-10).map(trend => ({
    ...trend,
    shortDate: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    shortAssignment: trend.assignmentName.length > 15 
      ? trend.assignmentName.substring(0, 15) + '...' 
      : trend.assignmentName
  }))

  const distributionData = distribution ? [
    { name: 'A (90-100%)', value: distribution.A, color: '#10B981' },
    { name: 'B (80-89%)', value: distribution.B, color: '#3B82F6' },
    { name: 'C (70-79%)', value: distribution.C, color: '#F59E0B' },
    { name: 'D (60-69%)', value: distribution.D, color: '#F97316' },
    { name: 'F (0-59%)', value: distribution.F, color: '#EF4444' },
  ].filter(item => item.value > 0) : []

  const currentAverage = trends.length > 0 ? 
    trends[trends.length - 1]?.runningAverage || 0 : 0

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 text-sage-600 mr-2" />
            Grade Performance
          </h2>
          <p className="text-sm text-warm-gray-600 mt-1">
            Track your academic progress over time
          </p>
        </div>
        
        {/* Chart Toggle */}
        <div className="flex bg-warm-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveChart('trends')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'trends'
                ? 'bg-white text-sage-700 shadow-sm'
                : 'text-warm-gray-600 hover:text-warm-gray-800'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveChart('distribution')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'distribution'
                ? 'bg-white text-sage-700 shadow-sm'
                : 'text-warm-gray-600 hover:text-warm-gray-800'
            }`}
          >
            Distribution
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-sage-50 rounded-xl">
          <div className="text-xl font-bold text-sage-600">
            {currentAverage.toFixed(1)}%
          </div>
          <div className="text-sm text-sage-700">Current Average</div>
        </div>
        
        <div className="text-center p-3 bg-lavender-50 rounded-xl">
          <div className="text-xl font-bold text-lavender-600">
            {totalGradedAssignments}
          </div>
          <div className="text-sm text-lavender-700">Graded Items</div>
        </div>
        
        <div className="text-center p-3 bg-peach-50 rounded-xl">
          <div className="text-xl font-bold text-peach-600">
            {trends.length > 1 ? 
              (trends[trends.length - 1]?.runningAverage - trends[0]?.runningAverage).toFixed(1) : 
              '0'
            }%
          </div>
          <div className="text-sm text-peach-700">Total Change</div>
        </div>
      </div>

      {/* Charts */}
      <div className="h-64 lg:h-80">
        {activeChart === 'trends' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="shortDate" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: any, name: string) => [
                  `${value}%`,
                  name === 'grade' ? 'Grade' : 'Running Average'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="grade" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                name="grade"
              />
              <Line 
                type="monotone" 
                dataKey="runningAverage" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981', r: 4 }}
                name="runningAverage"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name.split(' ')[0]}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} assignments`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend for trends chart */}
      {activeChart === 'trends' && (
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            <span className="text-warm-gray-600">Individual Grades</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-green-500 mr-2 border-dashed border-t-2 border-green-500"></div>
            <span className="text-warm-gray-600">Running Average</span>
          </div>
        </div>
      )}

      {/* Recent Performance Insight */}
      {trends.length >= 3 && (
        <div className="mt-6 pt-6 border-t border-warm-gray-100">
          <div className="bg-sage-50 rounded-xl p-4">
            <h4 className="font-medium text-warm-gray-800 mb-2">📈 Recent Insight</h4>
            <p className="text-sm text-warm-gray-600">
              {(() => {
                const recentGrades = trends.slice(-3).map(t => t.grade)
                const avg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length
                const isImproving = recentGrades[2] > recentGrades[0]
                
                if (avg >= 90) {
                  return "🌟 Excellent work! You're maintaining outstanding performance."
                } else if (isImproving) {
                  return "📈 Great trend! Your recent grades show improvement."
                } else if (avg >= 80) {
                  return "💪 Solid performance! Keep up the good work."
                } else {
                  return "🎯 Focus time! Consider reviewing study strategies."
                }
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
