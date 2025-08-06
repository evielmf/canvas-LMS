'use client'

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'
import { useCallback, useRef, useEffect } from 'react'

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

// Create a debounced fetch function to prevent rapid successive calls
const createDebouncedFetch = (delay: number = 100) => {
  const timeouts = new Map<string, NodeJS.Timeout>()
  
  return (url: string, key: string): Promise<Response> => {
    return new Promise((resolve, reject) => {
      // Clear existing timeout for this key
      const existingTimeout = timeouts.get(key)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }
      
      // Set new timeout
      const timeout = setTimeout(async () => {
        try {
          console.time(`API_FETCH_${key}`)
          const response = await fetch(url).catch(error => {
            console.error(`❌ Network error fetching ${key}:`, error)
            throw new Error(`Network error: ${error.message}`)
          })
          console.timeEnd(`API_FETCH_${key}`)
          
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
            console.error(`❌ HTTP error for ${key}: ${response.status} - ${errorText}`)
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          timeouts.delete(key)
          resolve(response)
        } catch (error) {
          timeouts.delete(key)
          reject(error)
        }
      }, delay)
      
      timeouts.set(key, timeout)
    })
  }
}

// Global debounced fetch instance
const debouncedFetch = createDebouncedFetch(50) // 50ms debounce

// Optimized parallel data fetching with aggressive caching
export function useCanvasData() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()
  const fetchStartTime = useRef<number>(0)

  // Performance tracking
  useEffect(() => {
    fetchStartTime.current = performance.now()
  }, []) // Empty dependency array is correct here

  // Ultra-optimized fetch function with parallel support
  const optimizedFetch = useCallback(async (endpoint: string, dataType: string) => {
    const startTime = performance.now()
    
    try {
      const response = await debouncedFetch(`/api/canvas/${endpoint}`, `${dataType}_${user?.id}`)
      const data = await response.json()
      
      const fetchTime = performance.now() - startTime
      console.log(`⚡ ${dataType} fetch completed in ${fetchTime.toFixed(1)}ms`)
      
      return data[dataType] || []
    } catch (error) {
      console.error(`❌ ${dataType} fetch failed:`, error)
      throw error
    }
  }, [user?.id])

  // NEW: Single parallel fetch for all data
  const fetchAllParallel = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      const response = await debouncedFetch(`/api/canvas/all`, `all_data_${user?.id}`)
      const data = await response.json()
      
      const fetchTime = performance.now() - startTime
      console.log(`🚀 PARALLEL fetch completed in ${fetchTime.toFixed(1)}ms`)
      
      return {
        courses: data.courses || [],
        assignments: data.assignments || [], 
        grades: data.grades || []
      }
    } catch (error) {
      console.error(`❌ Parallel fetch failed:`, error)
      throw error
    }
  }, [user?.id])

  // Use single parallel query instead of multiple separate queries
  const parallelQuery = useQuery({
    queryKey: ['canvas-all-data', user?.id],
    queryFn: fetchAllParallel,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, error: any) => {
      if (error?.message?.includes('401')) return false
      return failureCount < 2
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Extract data from parallel query
  const courses = parallelQuery.data?.courses || []
  const assignments = parallelQuery.data?.assignments || []
  const grades = parallelQuery.data?.grades || []
  
  // Performance metrics
  const loading = parallelQuery.isLoading
  const error = parallelQuery.error

  // Optimized refetch with performance tracking
  const refetchAll = useCallback(async () => {
    const refetchStart = performance.now()
    console.log('🔄 Starting parallel refetch...')
    
    try {
      await parallelQuery.refetch()
      
      const refetchTime = performance.now() - refetchStart
      console.log(`⚡ Parallel refetch completed in ${refetchTime.toFixed(1)}ms`)
    } catch (error) {
      console.error('❌ Refetch failed:', error)
      throw error
    }
  }, [parallelQuery])

  // Preload all data
  const preloadData = useCallback(async () => {
    if (!user) return
    
    const queryKey = ['canvas-all-data', user.id]
    const cachedData = queryClient.getQueryData(queryKey)
    
    if (!cachedData) {
      console.log(`🚀 Preloading all Canvas data...`)
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: fetchAllParallel,
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [user, queryClient, fetchAllParallel])

  // Background refresh for stale data
  const backgroundRefresh = useCallback(async () => {
    if (!user) return
    
    if (parallelQuery.isStale && !parallelQuery.isFetching && parallelQuery.data) {
      console.log(`🔄 Background refreshing stale parallel query`)
      await parallelQuery.refetch()
    }
  }, [parallelQuery, user])

  // Log performance metrics
  useEffect(() => {
    const totalTime = performance.now() - fetchStartTime.current
    if (!loading && totalTime > 0) {
      console.log(`📊 Canvas data hook completed in ${totalTime.toFixed(1)}ms`)
    }
  }, [loading])

  return {
    courses,
    assignments, 
    grades,
    loading,
    error,
    refetch: refetchAll,
    
    // Individual query states for granular control
    coursesLoading: loading,
    assignmentsLoading: loading,
    gradesLoading: loading,
    
    // Individual refetch functions (now all use the same parallel refetch)
    refetchCourses: parallelQuery.refetch,
    refetchAssignments: parallelQuery.refetch,
    refetchGrades: parallelQuery.refetch,
    
    // Performance utilities
    preloadData,
    backgroundRefresh,
    
    // Cache status
    isCached: {
      courses: !!courses.length && !loading,
      assignments: !!assignments.length && !loading,
      grades: !!grades.length && !loading,
    }
  }
}

// High-performance hook for dashboard that preloads everything
export function useCanvasDataParallel() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['canvas-all-data', user?.id],
    queryFn: async () => {
      const startTime = performance.now()
      console.log('🚀 Starting parallel Canvas data fetch...')
      
      try {
        // Fetch all data in parallel with Promise.all for maximum speed
        const [coursesRes, assignmentsRes, gradesRes] = await Promise.all([
          debouncedFetch('/api/canvas/courses', `courses_${user?.id}`),
          debouncedFetch('/api/canvas/assignments', `assignments_${user?.id}`),
          debouncedFetch('/api/canvas/grades', `grades_${user?.id}`)
        ])

        const [coursesData, assignmentsData, gradesData] = await Promise.all([
          coursesRes.json(),
          assignmentsRes.json(),
          gradesRes.json()
        ])

        const totalTime = performance.now() - startTime
        console.log(`⚡ Parallel fetch completed in ${totalTime.toFixed(1)}ms`)

        return {
          courses: coursesData.courses || [],
          assignments: assignmentsData.assignments || [],
          grades: gradesData.grades || [],
          fetchTime: totalTime,
          parallel: true
        }
      } catch (error) {
        console.error('❌ Parallel fetch failed:', error)
        throw error
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

// Optimized individual hooks with smart caching
export function useCanvasCourses() {
  const { user } = useSupabase()
  
  return useQuery({
    queryKey: ['canvas-courses', user?.id],
    queryFn: async () => {
      const response = await debouncedFetch('/api/canvas/courses', `courses_${user?.id}`)
      const data = await response.json()
      return data.courses || []
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useCanvasAssignments() {
  const { user } = useSupabase()
  
  return useQuery({
    queryKey: ['canvas-assignments', user?.id],
    queryFn: async () => {
      const response = await debouncedFetch('/api/canvas/assignments', `assignments_${user?.id}`)
      const data = await response.json()
      return data.assignments || []
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useCanvasGrades() {
  const { user } = useSupabase()
  
  return useQuery({
    queryKey: ['canvas-grades', user?.id],
    queryFn: async () => {
      const response = await debouncedFetch('/api/canvas/grades', `grades_${user?.id}`)
      const data = await response.json()
      return data.grades || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
