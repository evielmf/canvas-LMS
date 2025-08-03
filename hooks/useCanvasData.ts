'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'

export interface CanvasCourse {
  id: string
  name: string
  course_code: string
  start_at: string
  end_at: string
  workflow_state: string
}

export interface CanvasAssignment {
  id: string
  name: string
  description: string
  due_at: string | null
  points_possible: number
  course_id: string
  submission_types?: string[]
  html_url?: string
  course?: CanvasCourse
  submission?: {
    id: string
    score: number | null
    submitted_at: string | null
    workflow_state: string
  } | null
}

export interface CanvasGrade {
  id: string
  score: number
  points_possible: number
  assignment_name: string
  course_name: string
  graded_at: string
}

export function useCanvasData() {
  const { user } = useSupabase()

  // Fetch courses
  const { 
    data: coursesData, 
    isLoading: coursesLoading, 
    error: coursesError,
    refetch: refetchCourses 
  } = useQuery({
    queryKey: ['canvas-courses', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/canvas/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      const data = await response.json()
      return data.courses || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch assignments
  const { 
    data: assignmentsData, 
    isLoading: assignmentsLoading, 
    error: assignmentsError,
    refetch: refetchAssignments 
  } = useQuery({
    queryKey: ['canvas-assignments', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/canvas/assignments')
      if (!response.ok) {
        throw new Error('Failed to fetch assignments')
      }
      const data = await response.json()
      return data.assignments || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch grades
  const { 
    data: gradesData, 
    isLoading: gradesLoading, 
    error: gradesError,
    refetch: refetchGrades 
  } = useQuery({
    queryKey: ['canvas-grades', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/canvas/grades')
      if (!response.ok) {
        throw new Error('Failed to fetch grades')
      }
      const data = await response.json()
      return data.grades || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const loading = coursesLoading || assignmentsLoading || gradesLoading
  const error = coursesError || assignmentsError || gradesError

  const refetchAll = () => {
    refetchCourses()
    refetchAssignments()
    refetchGrades()
  }

  return {
    courses: coursesData as CanvasCourse[],
    assignments: assignmentsData as CanvasAssignment[],
    grades: gradesData as CanvasGrade[],
    loading,
    error,
    refetch: refetchAll,
  }
}
