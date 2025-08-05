'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'

export interface WeeklyProductivity {
  assignmentsDue: number
  assignmentsCompleted: number
  completionRate: number
  totalCourses: number
  weekStart: string
  weekEnd: string
}

export interface CourseHealth {
  courseId: string
  courseName: string
  courseCode: string
  healthScore: number
  completionRate: number
  averageGrade: number
  totalAssignments: number
  completedAssignments: number
  gradedAssignments: number
}

export interface GradeTrend {
  date: string
  grade: number
  runningAverage: number
  assignmentName: string
  courseName: string
  pointsEarned: number
  pointsPossible: number
}

export interface GradeDistribution {
  A: number
  B: number
  C: number
  D: number
  F: number
}

export interface StudySession {
  id: string
  user_id: string
  course_id?: string
  course_name?: string
  duration_minutes: number
  activity_type: string
  started_at: string
  completed_at?: string
  notes?: string
  created_at: string
}

export function useAnalyticsData() {
  const { user } = useSupabase()

  // Fetch weekly productivity data
  const { 
    data: weeklyData, 
    isLoading: weeklyLoading, 
    error: weeklyError,
    refetch: refetchWeekly 
  } = useQuery({
    queryKey: ['analytics-weekly', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/analytics/weekly')
      if (!response.ok) {
        throw new Error('Failed to fetch weekly analytics')
      }
      const data = await response.json()
      return data.weeklyProductivity as WeeklyProductivity
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch course health data
  const { 
    data: courseHealthData, 
    isLoading: courseHealthLoading, 
    error: courseHealthError,
    refetch: refetchCourseHealth 
  } = useQuery({
    queryKey: ['analytics-course-health', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/analytics/course-health')
      if (!response.ok) {
        throw new Error('Failed to fetch course health data')
      }
      const data = await response.json()
      return data.courseHealth as CourseHealth[]
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch grade trends data
  const { 
    data: gradeTrendsData, 
    isLoading: gradeTrendsLoading, 
    error: gradeTrendsError,
    refetch: refetchGradeTrends 
  } = useQuery({
    queryKey: ['analytics-grade-trends', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/analytics/grade-trends')
      if (!response.ok) {
        throw new Error('Failed to fetch grade trends data')
      }
      const data = await response.json()
      return {
        trends: data.gradeTrends as GradeTrend[],
        distribution: data.gradeDistribution as GradeDistribution,
        totalGradedAssignments: data.totalGradedAssignments as number
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch study sessions data
  const { 
    data: studySessionsData, 
    isLoading: studySessionsLoading, 
    error: studySessionsError,
    refetch: refetchStudySessions 
  } = useQuery({
    queryKey: ['analytics-study-sessions', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/analytics/study-sessions')
      if (!response.ok) {
        throw new Error('Failed to fetch study sessions data')
      }
      const data = await response.json()
      return data.sessions as StudySession[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const loading = weeklyLoading || courseHealthLoading || gradeTrendsLoading || studySessionsLoading
  const error = weeklyError || courseHealthError || gradeTrendsError || studySessionsError

  const refetchAll = () => {
    refetchWeekly()
    refetchCourseHealth()
    refetchGradeTrends()
    refetchStudySessions()
  }

  return {
    weeklyProductivity: weeklyData,
    courseHealth: courseHealthData,
    gradeTrends: gradeTrendsData?.trends,
    gradeDistribution: gradeTrendsData?.distribution,
    totalGradedAssignments: gradeTrendsData?.totalGradedAssignments,
    studySessions: studySessionsData,
    loading,
    error,
    refetch: refetchAll,
  }
}
