'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'
import { useCallback } from 'react'

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

// Cache-only hook - only reads from cache, never fetches automatically
export function useCanvasDataCached() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()

  // Get courses from cache only
  const coursesQuery = useQuery<{ courses: CanvasCourse[] }>({
    queryKey: ['canvas-courses', user?.id],
    queryFn: () => {
      // This will never run - we only read from cache
      throw new Error('Cache-only query should not fetch')
    },
    enabled: false, // Never fetch automatically
    staleTime: Infinity, // Cache never goes stale
    gcTime: Infinity, // Cache never gets garbage collected
  })

  // Get assignments from cache only
  const assignmentsQuery = useQuery<{ assignments: CanvasAssignment[] }>({
    queryKey: ['canvas-assignments', user?.id],
    queryFn: () => {
      // This will never run - we only read from cache
      throw new Error('Cache-only query should not fetch')
    },
    enabled: false, // Never fetch automatically
    staleTime: Infinity, // Cache never goes stale
    gcTime: Infinity, // Cache never gets garbage collected
  })

  // Get grades from cache only
  const gradesQuery = useQuery<{ grades: CanvasGrade[] }>({
    queryKey: ['canvas-grades', user?.id],
    queryFn: () => {
      // This will never run - we only read from cache
      throw new Error('Cache-only query should not fetch')
    },
    enabled: false, // Never fetch automatically
    staleTime: Infinity, // Cache never goes stale
    gcTime: Infinity, // Cache never gets garbage collected
  })

  // Manual sync function that actually fetches data
  const syncData = useCallback(async (): Promise<{
    courses: CanvasCourse[]
    assignments: CanvasAssignment[]
    grades: CanvasGrade[]
  } | undefined> => {
    if (!user) return undefined

    console.log('🔄 Manual sync triggered - fetching fresh Canvas data...')
    
    try {
      // Fetch all data in parallel
      const [coursesRes, assignmentsRes, gradesRes] = await Promise.all([
        fetch('/api/canvas/courses'),
        fetch('/api/canvas/assignments'),
        fetch('/api/canvas/grades')
      ])

      if (!coursesRes.ok || !assignmentsRes.ok || !gradesRes.ok) {
        throw new Error('Failed to fetch Canvas data')
      }

      const [coursesData, assignmentsData, gradesData] = await Promise.all([
        coursesRes.json(),
        assignmentsRes.json(), 
        gradesRes.json()
      ])

      // Update cache with fresh data
      queryClient.setQueryData(['canvas-courses', user.id], coursesData)
      queryClient.setQueryData(['canvas-assignments', user.id], assignmentsData)
      queryClient.setQueryData(['canvas-grades', user.id], gradesData)

      console.log('✅ Manual sync completed - cache updated')
      return {
        courses: coursesData.courses || [],
        assignments: assignmentsData.assignments || [],
        grades: gradesData.grades || []
      }
    } catch (error) {
      console.error('❌ Manual sync failed:', error)
      throw error
    }
  }, [user, queryClient])

  // Check if we have any cached data
  const hasData = useCallback(() => {
    const coursesData = queryClient.getQueryData(['canvas-courses', user?.id])
    const assignmentsData = queryClient.getQueryData(['canvas-assignments', user?.id])
    const gradesData = queryClient.getQueryData(['canvas-grades', user?.id])
    
    return !!(coursesData || assignmentsData || gradesData)
  }, [queryClient, user?.id])

  return {
    // Data from cache only
    courses: coursesQuery.data?.courses || [],
    assignments: assignmentsQuery.data?.assignments || [],
    grades: gradesQuery.data?.grades || [],
    
    // Loading states (always false since we don't auto-fetch)
    loading: false,
    coursesLoading: false,
    assignmentsLoading: false,
    gradesLoading: false,
    
    // Error states
    error: coursesQuery.error || assignmentsQuery.error || gradesQuery.error,
    
    // Manual sync function
    syncData,
    
    // Utility functions
    hasData: hasData(),
    
    // Legacy refetch for compatibility (maps to syncData)
    refetch: syncData
  }
}

// Individual cache-only hooks for specific data types
export function useCanvasCoursesCached() {
  const { user } = useSupabase()
  
  return useQuery({
    queryKey: ['canvas-courses', user?.id],
    queryFn: () => {
      throw new Error('Cache-only query should not fetch')
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useCanvasAssignmentsCached() {
  const { user } = useSupabase()
  
  return useQuery({
    queryKey: ['canvas-assignments', user?.id],
    queryFn: () => {
      throw new Error('Cache-only query should not fetch')
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useCanvasGradesCached() {
  const { user } = useSupabase()
  
  return useQuery({
    queryKey: ['canvas-grades', user?.id],
    queryFn: () => {
      throw new Error('Cache-only query should not fetch')
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
