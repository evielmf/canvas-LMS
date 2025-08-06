'use client'

import { useQueries, useQuery } from '@tanstack/react-query'
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

// Optimized parallel data fetching
export function useCanvasData() {
  const { user } = useSupabase()

  // Use useQueries for parallel fetching
  const queries = useQueries({
    queries: [
      {
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
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchInterval: false,
        refetchOnMount: 'always', // Always check cache first
        refetchOnReconnect: false,
        retry: 2,
      },
      {
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
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchInterval: false,
        refetchOnMount: 'always',
        refetchOnReconnect: false,
        retry: 2,
      },
      {
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
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchInterval: false,
        refetchOnMount: 'always',
        refetchOnReconnect: false,
        retry: 2,
      },
    ],
  })

  const [coursesQuery, assignmentsQuery, gradesQuery] = queries

  const loading = coursesQuery.isLoading || assignmentsQuery.isLoading || gradesQuery.isLoading
  const error = coursesQuery.error || assignmentsQuery.error || gradesQuery.error

  const refetchAll = () => {
    coursesQuery.refetch()
    assignmentsQuery.refetch()
    gradesQuery.refetch()
  }

  return {
    courses: (coursesQuery.data as CanvasCourse[]) || [],
    assignments: (assignmentsQuery.data as CanvasAssignment[]) || [],
    grades: (gradesQuery.data as CanvasGrade[]) || [],
    loading,
    error,
    refetch: refetchAll,
    // Individual query states for more granular control
    coursesLoading: coursesQuery.isLoading,
    assignmentsLoading: assignmentsQuery.isLoading,
    gradesLoading: gradesQuery.isLoading,
  }
}

// Optimized hook for specific data types when you only need one type
export function useCanvasCourses() {
  const { user } = useSupabase()
  
  return useQuery({
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
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })
}

export function useCanvasAssignments() {
  const { user } = useSupabase()
  
  return useQuery({
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
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })
}

export function useCanvasGrades() {
  const { user } = useSupabase()
  
  return useQuery({
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
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })
}
