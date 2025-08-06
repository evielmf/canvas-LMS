'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'
import { CourseNameMapping, courseNameMapper } from '@/utils/course-name-mapper'

export function useCourseNameMappings() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()

  // Fetch course mappings
  const { 
    data: mappings = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['course-mappings', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/canvas/course-mapping')
      if (!response.ok) {
        throw new Error('Failed to fetch course mappings')
      }
      const data = await response.json()
      
      // Update the global mapper with the latest mappings
      courseNameMapper.setMappings(data.mappings)
      
      return data.mappings as CourseNameMapping[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Create or update course mapping
  const createMappingMutation = useMutation({
    mutationFn: async (mapping: {
      course_id: string
      original_name?: string
      mapped_name: string
    }) => {
      const response = await fetch('/api/canvas/course-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapping),
      })

      if (!response.ok) {
        throw new Error('Failed to save course mapping')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch course mappings
      queryClient.invalidateQueries({ queryKey: ['course-mappings'] })
      // Also invalidate related data that might use course names
      queryClient.invalidateQueries({ queryKey: ['canvas-grades'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-grade-trends'] })
    },
  })

  // Delete course mapping
  const deleteMappingMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/canvas/course-mapping?course_id=${courseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete course mapping')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch course mappings
      queryClient.invalidateQueries({ queryKey: ['course-mappings'] })
      // Also invalidate related data that might use course names
      queryClient.invalidateQueries({ queryKey: ['canvas-grades'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-grade-trends'] })
    },
  })

  return {
    mappings,
    isLoading,
    error,
    refetch,
    createMapping: createMappingMutation.mutate,
    deleteMapping: deleteMappingMutation.mutate,
    isCreating: createMappingMutation.isPending,
    isDeleting: deleteMappingMutation.isPending,
    createError: createMappingMutation.error,
    deleteError: deleteMappingMutation.error,
  }
}
