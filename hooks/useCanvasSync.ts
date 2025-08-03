'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'
import { toast } from 'react-hot-toast'
import { useRef } from 'react'

export interface SyncStatus {
  lastSync: string | null
  canvasUrl: string | null
  cached: {
    courses: number
    assignments: number
  }
  needsSync: boolean
}

export interface SyncStats {
  courses: number
  assignments: number
  submissions: number
  lastSync: string
  errors: string[]
}

export function useCanvasSync() {
  const { user } = useSupabase()
  const queryClient = useQueryClient()
  const autoSyncAttempted = useRef(false)

  // Get sync status
  const { 
    data: syncStatus, 
    isLoading: statusLoading,
    refetch: refetchStatus
  } = useQuery<SyncStatus>({
    queryKey: ['canvas-sync-status', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/canvas/auto-sync')
      if (!response.ok) {
        throw new Error('Failed to fetch sync status')
      }
      return response.json()
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic polling to prevent loops
  })

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/canvas/auto-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || 'Sync failed')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      console.log('✅ Canvas sync completed:', data.stats)
      
      // Show success toast
      toast.success(
        `Sync completed! ${data.stats.courses} courses, ${data.stats.assignments} assignments`,
        { duration: 5000 }
      )
      
      // Invalidate all Canvas data queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['canvas-courses'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-grades'] })
      queryClient.invalidateQueries({ queryKey: ['canvas-sync-status'] })
      
      // Refresh status
      refetchStatus()
    },
    onError: (error: Error) => {
      console.error('❌ Canvas sync failed:', error)
      toast.error(`Sync failed: ${error.message}`, { duration: 8000 })
    }
  })

  // Auto-sync if needed (only once per session)
  const autoSyncMutation = useMutation({
    mutationFn: async () => {
      // Only auto-sync if data is stale and user hasn't manually synced recently
      if (syncStatus?.needsSync) {
        console.log('🔄 Auto-syncing Canvas data...')
        return syncMutation.mutateAsync()
      }
      return Promise.resolve()
    },
    onSuccess: () => {
      console.log('✅ Auto-sync completed')
      autoSyncAttempted.current = false // Reset flag on success
    },
    onError: (error) => {
      console.warn('⚠️ Auto-sync failed:', error)
      autoSyncAttempted.current = false // Reset flag on error
      // Don't show error toast for auto-sync failures
    }
  })

  const triggerSync = () => {
    syncMutation.mutate()
  }

  const triggerAutoSync = () => {
    if (syncStatus?.needsSync && !syncMutation.isPending && !autoSyncAttempted.current) {
      autoSyncAttempted.current = true
      autoSyncMutation.mutate()
    }
  }

  // Helper function to get sync status text
  const getSyncStatusText = () => {
    if (!syncStatus) return 'Unknown'
    
    if (syncMutation.isPending) return 'Syncing...'
    
    if (!syncStatus.lastSync) return 'Never synced'
    
    const lastSync = new Date(syncStatus.lastSync)
    const now = new Date()
    const hoursAgo = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60))
    
    if (hoursAgo === 0) {
      const minutesAgo = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60))
      return `${minutesAgo} minutes ago`
    } else if (hoursAgo < 24) {
      return `${hoursAgo} hours ago`
    } else {
      const daysAgo = Math.floor(hoursAgo / 24)
      return `${daysAgo} days ago`
    }
  }

  // Helper function to get cache summary
  const getCacheSummary = () => {
    if (!syncStatus) return null
    
    return {
      total: syncStatus.cached.courses + syncStatus.cached.assignments,
      courses: syncStatus.cached.courses,
      assignments: syncStatus.cached.assignments,
      isEmpty: syncStatus.cached.courses === 0 && syncStatus.cached.assignments === 0
    }
  }

  return {
    // Status
    syncStatus,
    statusLoading,
    
    // Sync actions
    triggerSync,
    triggerAutoSync,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    
    // Helper functions
    getSyncStatusText,
    getCacheSummary,
    
    // Refetch status
    refetchStatus
  }
}