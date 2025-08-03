'use client'

import { useState } from 'react'
import { useCanvasData } from '@/hooks/useCanvasData'
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  BookOpen,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const filterOptions = [
  { value: 'all', label: 'All Courses' },
  { value: 'current', label: 'Current Term' },
]

const COLORS = ['#0374B5', '#FC5E13', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function GradesView() {
  const { assignments, courses, grades, loading } = useCanvasData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState('')

  // Ensure grades is always an array
  const safeGrades = grades || []

  // Process grades by course
  const gradesByCourse = safeGrades.reduce((acc, grade) => {
    const courseId = grade.course_name || 'Unknown Course'
    if (!acc[courseId]) {
      acc[courseId] = {
        courseName: grade.course_name || 'Unknown Course',
        grades: [],
        totalPoints: 0,
        earnedPoints: 0,
      }
    }
    acc[courseId].grades.push(grade)
    acc[courseId].totalPoints += grade.points_possible || 0
    acc[courseId].earnedPoints += grade.score || 0
    return acc
  }, {} as Record<string, any>)

  // Calculate course averages
  const courseAverages = Object.values(gradesByCourse).map((course: any) => {
    const courseName = course.courseName || 'Unknown Course'
    return {
      name: courseName.length > 20 ? courseName.substring(0, 20) + '...' : courseName,
      fullName: courseName,
      average: course.totalPoints > 0 ? (course.earnedPoints / course.totalPoints) * 100 : 0,
      totalGrades: course.grades?.length || 0,
    }
  })

  // Grade distribution
  const gradeDistribution = safeGrades.reduce((acc, grade) => {
    const pointsPossible = grade.points_possible || 0
    const score = grade.score || 0
    const percentage = pointsPossible > 0 ? (score / pointsPossible) * 100 : 0
    if (percentage >= 90) acc.A++
    else if (percentage >= 80) acc.B++
    else if (percentage >= 70) acc.C++
    else if (percentage >= 60) acc.D++
    else acc.F++
    return acc
  }, { A: 0, B: 0, C: 0, D: 0, F: 0 })

  const distributionData = [
    { name: 'A (90-100%)', value: gradeDistribution.A, color: '#10B981' },
    { name: 'B (80-89%)', value: gradeDistribution.B, color: '#3B82F6' },
    { name: 'C (70-79%)', value: gradeDistribution.C, color: '#F59E0B' },
    { name: 'D (60-69%)', value: gradeDistribution.D, color: '#F97316' },
    { name: 'F (0-59%)', value: gradeDistribution.F, color: '#EF4444' },
  ].filter(item => item.value > 0)

  // Recent grades
  const recentGrades = safeGrades.slice(0, 10)

  // Overall stats
  const overallAverage = safeGrades.length ? 
    safeGrades.reduce((sum, grade) => {
      const pointsPossible = grade.points_possible || 0
      const score = grade.score || 0
      const percentage = pointsPossible > 0 ? (score / pointsPossible) * 100 : 0
      return sum + percentage
    }, 0) / safeGrades.length : 0

  const filteredGrades = safeGrades.filter(grade => {
    const assignmentName = grade.assignment_name || ''
    const courseName = grade.course_name || ''
    
    if (searchTerm && !assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !courseName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedCourse && courseName !== selectedCourse) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grades & Progress</h1>
        <p className="text-gray-600">
          Track your academic performance across all courses.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Overall Average</div>
              <div className="text-2xl font-bold text-gray-900">
                {overallAverage ? `${overallAverage.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Total Grades</div>
              <div className="text-2xl font-bold text-gray-900">{safeGrades.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">A Grades</div>
              <div className="text-2xl font-bold text-gray-900">{gradeDistribution.A}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Courses</div>
              <div className="text-2xl font-bold text-gray-900">{Object.keys(gradesByCourse).length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Course Averages Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Averages</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName
                    }
                    return label
                  }}
                />
                <Bar dataKey="average" fill="#0374B5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search grades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Course Filter */}
          <div className="sm:w-64">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              aria-label="Filter by course"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent"
            >
              <option value="">All Courses</option>
              {Object.keys(gradesByCourse).map(courseName => (
                <option key={courseName} value={courseName}>
                  {courseName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Grades</h2>
        </div>
        
        {filteredGrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Graded
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade, index) => {
                  const pointsPossible = grade.points_possible || 0
                  const score = grade.score || 0
                  const percentage = pointsPossible > 0 ? (score / pointsPossible) * 100 : 0
                  const getGradeColor = (pct: number) => {
                    if (pct >= 90) return 'text-green-600'
                    if (pct >= 80) return 'text-blue-600'
                    if (pct >= 70) return 'text-yellow-600'
                    if (pct >= 60) return 'text-orange-600'
                    return 'text-red-600'
                  }

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.assignment_name || 'Unknown Assignment'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grade.course_name || 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {score}/{pointsPossible}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getGradeColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.graded_at ? format(new Date(grade.graded_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCourse
                ? 'Try adjusting your filters to see more grades.'
                : 'Connect your Canvas account to see your grades.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
