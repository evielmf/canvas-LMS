'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'
import { useCallback, useRef } from 'react'

/**
 * Universal prefetching hook that aggressively caches all Canvas data
 * This ensures instant tab switching by prefetching everything users might need
 */
export function useUniversalPrefetch() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const prefetchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Debounced prefetch to avoid multiple calls
  const debouncedPrefetch = useCallback((key: string, prefetchFn: () => Promise<void>, delay = 100) => {
    // Clear existing timeout for this key
    const existingTimeout = prefetchTimeouts.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        await prefetchFn()
        prefetchTimeouts.current.delete(key)
      } catch (error) {
        console.log(`Prefetch failed for ${key}:`, error)
        prefetchTimeouts.current.delete(key)
      }
    }, delay)

    prefetchTimeouts.current.set(key, timeout)
  }, [])

  // Prefetch assignments data
  const prefetchAssignments = useCallback(async () => {
    if (!user) return

    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['canvas-assignments', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/assignments')
          if (!response.ok) throw new Error('Failed to fetch assignments')
          const data = await response.json()
          return data.assignments || []
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: ['canvas-courses', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/courses')
          if (!response.ok) throw new Error('Failed to fetch courses')
          const data = await response.json()
          return data.courses || []
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
    ])
  }, [user, queryClient])

  // Prefetch grades data
  const prefetchGrades = useCallback(async () => {
    if (!user) return

    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['canvas-grades', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/grades')
          if (!response.ok) throw new Error('Failed to fetch grades')
          const data = await response.json()
          return data.grades || []
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: ['canvas-courses', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/courses')
          if (!response.ok) throw new Error('Failed to fetch courses')
          const data = await response.json()
          return data.courses || []
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
    ])
  }, [user, queryClient])

  // Prefetch schedule data (assignments + courses)
  const prefetchSchedule = useCallback(async () => {
    if (!user) return
    await prefetchAssignments() // Schedule uses assignment data
  }, [prefetchAssignments])

  // Prefetch analytics data (grades + assignments)
  const prefetchAnalytics = useCallback(async () => {
    if (!user) return

    await Promise.allSettled([
      prefetchGrades(),
      prefetchAssignments(),
    ])
  }, [prefetchGrades, prefetchAssignments])

  // Prefetch all Canvas data (used on dashboard load)
  const prefetchAllCanvasData = useCallback(async () => {
    if (!user) return

    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['canvas-courses', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/courses')
          if (!response.ok) throw new Error('Failed to fetch courses')
          const data = await response.json()
          return data.courses || []
        },
        staleTime: 30 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['canvas-assignments', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/assignments')
          if (!response.ok) throw new Error('Failed to fetch assignments')
          const data = await response.json()
          return data.assignments || []
        },
        staleTime: 15 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['canvas-grades', user.id],
        queryFn: async () => {
          const response = await fetch('/api/canvas/grades')
          if (!response.ok) throw new Error('Failed to fetch grades')
          const data = await response.json()
          return data.grades || []
        },
        staleTime: 10 * 60 * 1000,
      }),
    ])
  }, [user, queryClient])

  // Route-specific prefetch handlers with debouncing
  const handleAssignmentsPrefetch = useCallback(() => {
    debouncedPrefetch('assignments', prefetchAssignments)
  }, [debouncedPrefetch, prefetchAssignments])

  const handleGradesPrefetch = useCallback(() => {
    debouncedPrefetch('grades', prefetchGrades)
  }, [debouncedPrefetch, prefetchGrades])

  const handleSchedulePrefetch = useCallback(() => {
    debouncedPrefetch('schedule', prefetchSchedule)
  }, [debouncedPrefetch, prefetchSchedule])

  const handleAnalyticsPrefetch = useCallback(() => {
    debouncedPrefetch('analytics', prefetchAnalytics)
  }, [debouncedPrefetch, prefetchAnalytics])

  const handleDashboardPrefetch = useCallback(() => {
    debouncedPrefetch('dashboard', prefetchAllCanvasData)
  }, [debouncedPrefetch, prefetchAllCanvasData])

  return {
    prefetchAssignments: handleAssignmentsPrefetch,
    prefetchGrades: handleGradesPrefetch,
    prefetchSchedule: handleSchedulePrefetch,
    prefetchAnalytics: handleAnalyticsPrefetch,
    prefetchDashboard: handleDashboardPrefetch,
    prefetchAllCanvasData,
  }
}
