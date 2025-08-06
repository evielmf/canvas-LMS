'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'
import { useEffect } from 'react'

/**
 * Hook to prefetch Canvas data when user navigates to dashboard
 * This reduces loading time when switching between tabs
 */
export function useDataPrefetch() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()

  useEffect(() => {
    if (!user) return

    // Prefetch all Canvas data in parallel when dashboard loads
    const prefetchData = async () => {
      const queryKeys = [
        ['canvas-courses', user.id],
        ['canvas-assignments', user.id],
        ['canvas-grades', user.id],
      ]

      // Check if any data is missing from cache
      const missingData = queryKeys.filter(key => 
        !queryClient.getQueryData(key)
      )

      if (missingData.length > 0) {
        console.log('🚀 Prefetching missing Canvas data...')
        
        // Prefetch missing data in parallel
        await Promise.allSettled([
          missingData.includes(['canvas-courses', user.id]) && 
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
          
          missingData.includes(['canvas-assignments', user.id]) &&
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
          
          missingData.includes(['canvas-grades', user.id]) &&
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
        ].filter(Boolean))
        
        console.log('✅ Canvas data prefetch completed')
      }
    }

    // Debounce prefetch to avoid multiple calls
    const timeoutId = setTimeout(prefetchData, 100)
    
    return () => clearTimeout(timeoutId)
  }, [user, queryClient])
}

/**
 * Hook to prefetch data for a specific route before navigation
 */
export function usePrefetchRoute(route: 'assignments' | 'grades' | 'schedule' | 'analytics') {
  const queryClient = useQueryClient()
  const { user } = useSupabase()

  const prefetch = async () => {
    if (!user) return

    switch (route) {
      case 'assignments':
        await Promise.allSettled([
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
            queryKey: ['canvas-courses', user.id],
            queryFn: async () => {
              const response = await fetch('/api/canvas/courses')
              if (!response.ok) throw new Error('Failed to fetch courses')
              const data = await response.json()
              return data.courses || []
            },
            staleTime: 30 * 60 * 1000,
          }),
        ])
        break

      case 'grades':
        await Promise.allSettled([
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
        ])
        break

      case 'schedule':
        await Promise.allSettled([
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
            queryKey: ['canvas-courses', user.id],
            queryFn: async () => {
              const response = await fetch('/api/canvas/courses')
              if (!response.ok) throw new Error('Failed to fetch courses')
              const data = await response.json()
              return data.courses || []
            },
            staleTime: 30 * 60 * 1000,
          }),
        ])
        break

      case 'analytics':
        await Promise.allSettled([
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
        ])
        break
    }
  }

  return prefetch
}
