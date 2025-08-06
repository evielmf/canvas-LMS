'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'

export interface SyncConflict {
  id: string
  item_type: 'assignment' | 'course' | 'grade'
  item_id: string
  field: string
  cached_value: any
  live_value: any
  status: 'unresolved' | 'resolved' | 'ignored'
  detected_at: string
  resolved_at?: string
  resolved_by?: string
}

export interface ConflictsSummary {
  total_unresolved: number
  total_resolved: number
  total_ignored: number
  unresolved_assignment: number
  unresolved_course: number
  unresolved_grade: number
}

/**
 * Hook for managing sync conflicts
 */
export function useSyncConflicts() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()

  // Fetch conflicts
  const { 
    data: conflictsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['sync-conflicts', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/sync/conflicts?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch conflicts')
      }
      return response.json()
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  // Resolve conflict mutation
  const resolveMutation = useMutation({
    mutationFn: async (conflictId: string) => {
      const response = await fetch(`/api/sync/conflicts/${conflictId}/resolve`, {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to resolve conflict')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate conflicts and related data
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-courses'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-grades'] })
    },
  })

  // Ignore conflict mutation
  const ignoreMutation = useMutation({
    mutationFn: async (conflictId: string) => {
      const response = await fetch(`/api/sync/conflicts/${conflictId}/ignore`, {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ignore conflict')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
    },
  })

  // Batch resolve mutation
  const batchResolveMutation = useMutation({
    mutationFn: async (conflictIds: string[]) => {
      const response = await fetch('/api/sync/conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conflictIds,
          action: 'resolve',
          batchResolve: true
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to batch resolve conflicts')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-courses'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-grades'] })
    },
  })

  // Batch ignore mutation
  const batchIgnoreMutation = useMutation({
    mutationFn: async (conflictIds: string[]) => {
      const response = await fetch('/api/sync/conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conflictIds,
          action: 'ignore',
          batchResolve: false
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to batch ignore conflicts')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
    },
  })

  const conflicts: SyncConflict[] = conflictsData?.conflicts || []
  const summary: ConflictsSummary = conflictsData?.summary || {}
  const hasUnresolvedConflicts = (summary.total_unresolved || 0) > 0

  return {
    // Data
    conflicts,
    summary,
    hasUnresolvedConflicts,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch,
    resolveConflict: resolveMutation.mutateAsync,
    ignoreConflict: ignoreMutation.mutateAsync,
    batchResolve: batchResolveMutation.mutateAsync,
    batchIgnore: batchIgnoreMutation.mutateAsync,
    
    // Mutation states
    isResolving: resolveMutation.isPending,
    isIgnoring: ignoreMutation.isPending,
    isBatchResolving: batchResolveMutation.isPending,
    isBatchIgnoring: batchIgnoreMutation.isPending,
  }
}

/**
 * Hook to check if there are any unresolved conflicts (lightweight check)
 */
export function useHasConflicts() {
  const { user } = useSupabase()

  return useQuery({
    queryKey: ['sync-conflicts-check', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/sync/conflicts?limit=1')
      if (!response.ok) {
        return { hasConflicts: false, count: 0 }
      }
      const data = await response.json()
      return {
        hasConflicts: (data.summary?.total_unresolved || 0) > 0,
        count: data.summary?.total_unresolved || 0
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    refetchOnWindowFocus: true,
  })
}
