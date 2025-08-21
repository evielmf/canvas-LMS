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

// Cache-only hook - reads from cache but can populate from API
export function useCanvasDataCached() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()

  // Get courses from cache, populate if empty
  const coursesQuery = useQuery<{ courses: CanvasCourse[] }>({
    queryKey: ['canvas-courses', user?.id],
    queryFn: async () => {
      console.log('🔄 Fetching courses from API...')
      const response = await fetch('/api/canvas/courses')
      if (!response.ok) {
        console.error('❌ Courses API failed:', response.status, response.statusText)
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ Courses API response:', data)
      return data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })

  // Get assignments from cache, populate if empty
  const assignmentsQuery = useQuery<{ assignments: CanvasAssignment[] }>({
    queryKey: ['canvas-assignments', user?.id],
    queryFn: async () => {
      console.log('🔄 Fetching assignments from API...')
      const response = await fetch('/api/canvas/assignments')
      if (!response.ok) {
        console.error('❌ Assignments API failed:', response.status, response.statusText)
        throw new Error(`Failed to fetch assignments: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ Assignments API response:', data)
      return data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })

  // Get grades from cache, populate if empty
  const gradesQuery = useQuery<{ grades: CanvasGrade[] }>({
    queryKey: ['canvas-grades', user?.id],
    queryFn: async () => {
      console.log('🔄 Fetching grades from API...')
      const response = await fetch('/api/canvas/grades')
      if (!response.ok) {
        console.error('❌ Grades API failed:', response.status, response.statusText)
        throw new Error(`Failed to fetch grades: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ Grades API response:', data)
      return data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })

  // Manual sync function that actually fetches data with enhanced error handling
  const syncData = useCallback(async (): Promise<{
    courses: CanvasCourse[]
    assignments: CanvasAssignment[]
    grades: CanvasGrade[]
  } | undefined> => {
    if (!user) return undefined

    console.log('🔄 Manual sync triggered - fetching fresh Canvas data...')
    
    try {
      // First validate the Canvas token
      const tokenValidation = await fetch('/api/canvas/validate-token', {
        method: 'POST'
      })
      
      if (!tokenValidation.ok) {
        const error = await tokenValidation.json()
        if (error.needsReauth || error.needsSetup) {
          throw new Error('Canvas token invalid - authentication required')
        }
        throw new Error(error.details || 'Token validation failed')
      }
      
      console.log('✅ Canvas token validated successfully')
      
      // Fetch all data in parallel with timeout
      const fetchWithTimeout = (url: string, timeout = 30000) => {
        return Promise.race([
          fetch(url),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
          )
        ])
      }
      
      const [coursesRes, assignmentsRes, gradesRes] = await Promise.all([
        fetchWithTimeout('/api/canvas/courses'),
        fetchWithTimeout('/api/canvas/assignments'),
        fetchWithTimeout('/api/canvas/grades')
      ])

      // Check responses
      if (!coursesRes.ok) {
        const errorData = await coursesRes.json().catch(() => ({}))
        throw new Error(`Failed to fetch courses: ${errorData.details || coursesRes.statusText}`)
      }
      
      if (!assignmentsRes.ok) {
        const errorData = await assignmentsRes.json().catch(() => ({}))
        throw new Error(`Failed to fetch assignments: ${errorData.details || assignmentsRes.statusText}`)
      }
      
      if (!gradesRes.ok) {
        const errorData = await gradesRes.json().catch(() => ({}))
        throw new Error(`Failed to fetch grades: ${errorData.details || gradesRes.statusText}`)
      }

      const [coursesData, assignmentsData, gradesData] = await Promise.all([
        coursesRes.json(),
        assignmentsRes.json(), 
        gradesRes.json()
      ])

      // Validate data structure
      const courses = Array.isArray(coursesData.courses) ? coursesData.courses : []
      const assignments = Array.isArray(assignmentsData.assignments) ? assignmentsData.assignments : []
      const grades = Array.isArray(gradesData.grades) ? gradesData.grades : []

      // Update cache with fresh data
      queryClient.setQueryData(['canvas-courses', user.id], { courses })
      queryClient.setQueryData(['canvas-assignments', user.id], { assignments })
      queryClient.setQueryData(['canvas-grades', user.id], { grades })

      console.log(`✅ Manual sync completed - cache updated with ${courses.length} courses, ${assignments.length} assignments, ${grades.length} grades`)
      
      return { courses, assignments, grades }
    } catch (error: any) {
      console.error('❌ Manual sync failed:', error)
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to sync Canvas data'
      
      if (error.message.includes('timeout')) {
        userMessage = 'Sync timed out - Canvas might be slow. Please try again.'
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        userMessage = 'Canvas authentication failed. Please check your Canvas token.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Network error - please check your connection and try again.'
      }
      
      // Create error with user-friendly message
      const enhancedError = new Error(userMessage)
      ;(enhancedError as any).originalError = error
      
      throw enhancedError
    }
  }, [user, queryClient])

  // Check if we have any cached data
  const hasData = useCallback(() => {
    const courses = coursesQuery.data?.courses || []
    const assignments = assignmentsQuery.data?.assignments || []
    const grades = gradesQuery.data?.grades || []
    
    return courses.length > 0 || assignments.length > 0 || grades.length > 0
  }, [coursesQuery.data, assignmentsQuery.data, gradesQuery.data])

  return {
    // Data from cache only
    courses: coursesQuery.data?.courses || [],
    assignments: assignmentsQuery.data?.assignments || [],
    grades: gradesQuery.data?.grades || [],
    
    // Loading states
    loading: coursesQuery.isLoading || assignmentsQuery.isLoading || gradesQuery.isLoading,
    coursesLoading: coursesQuery.isLoading,
    assignmentsLoading: assignmentsQuery.isLoading,
    gradesLoading: gradesQuery.isLoading,
    
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
