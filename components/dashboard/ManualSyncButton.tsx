'use client'

import { useState } from 'react'
import { useCanvasDataCached } from '@/hooks/useCanvasDataCached'
import { RefreshCw, Database, CheckCircle, AlertCircle, Cloud, Download, Wifi, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'

interface ManualSyncButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'card'
  size?: 'sm' | 'default' | 'lg'
  showStats?: boolean
}

interface SyncResult {
  success: boolean
  data?: {
    courses: number
    assignments: number
    syncTime: string
  }
  conflicts?: {
    total: number
    autoResolved: number
    requiresUserInput: number
    hasConflicts: boolean
  }
  warnings?: {
    failedCourses: number
    courseNames: string[]
    message: string
  }
  error?: string
  details?: string
  needsReauth?: boolean
  canRetry?: boolean
}

export default function ManualSyncButton({ 
  className = '',
  variant = 'default',
  size = 'default',
  showStats = true
}: ManualSyncButtonProps) {
  const { syncData, hasData, courses, assignments, grades } = useCanvasDataCached()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isFullSyncing, setIsFullSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncStatus, setSyncStatus] = useState<string>('')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  const performQuickSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    const startTime = performance.now()

    try {
      toast.loading('Syncing Canvas data...', { id: 'sync-toast' })
      
      const result = await syncData()
      
      const syncTime = performance.now() - startTime
      setLastSync(new Date())
      
      if (result) {
        toast.success(
          `Sync completed! ${result.courses.length} courses, ${result.assignments.length} assignments (${syncTime.toFixed(0)}ms)`,
          { 
            id: 'sync-toast',
            duration: 4000,
            icon: '✅'
          }
        )
      } else {
        toast.success('Sync completed!', { 
          id: 'sync-toast',
          duration: 4000,
          icon: '✅'
        })
      }
    } catch (error: any) {
      console.error('Sync failed:', error)
      
      // Enhanced error handling
      if (error.message.includes('authentication') || error.message.includes('token')) {
        toast.error('Canvas authentication failed. Please re-authenticate with Canvas.', { 
          id: 'sync-toast',
          duration: 6000 
        })
      } else if (error.message.includes('timeout')) {
        toast.error('Sync timed out. Canvas might be slow - please try again.', { 
          id: 'sync-toast',
          duration: 6000 
        })
      } else {
        toast.error(`Sync failed: ${error.message}`, { 
          id: 'sync-toast',
          duration: 6000 
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const performFullSync = async () => {
    setIsFullSyncing(true)
    setSyncProgress(0)
    setSyncStatus('Validating Canvas token...')
    
    try {
      // Step 1: Validate token
      setSyncProgress(10)
      const tokenResponse = await fetch('/api/canvas/validate-token', {
        method: 'POST'
      })
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.json()
        throw new Error(error.details || 'Token validation failed')
      }
      
      setSyncStatus('Token validated ✓')
      setSyncProgress(20)
      
      // Step 2: Perform full Canvas sync
      setSyncStatus('Syncing Canvas data...')
      setSyncProgress(30)
      
      const syncResponse = await fetch('/api/canvas/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      setSyncProgress(70)
      setSyncStatus('Processing sync results...')
      
      const syncResult: SyncResult = await syncResponse.json()
      
      if (!syncResponse.ok) {
        throw new Error(syncResult.details || syncResult.error || 'Sync failed')
      }
      
      setSyncProgress(90)
      setSyncStatus('Updating local cache...')
      
      // Step 3: Refresh local cache
      await syncData()
      
      setSyncProgress(100)
      setSyncStatus('Sync completed! ✨')
      setLastSync(new Date())
      
      setLastSyncResult(syncResult)
      
      // Show appropriate success message
      if (syncResult.warnings?.failedCourses) {
        toast.success(
          `Sync completed with warnings! ${syncResult.data?.courses || 0} courses, ${syncResult.data?.assignments || 0} assignments synced. ${syncResult.warnings.failedCourses} courses had issues.`,
          { duration: 6000 }
        )
      } else {
        toast.success(
          `Canvas sync successful! 🎉 Synced ${syncResult.data?.courses || 0} courses and ${syncResult.data?.assignments || 0} assignments.`,
          { duration: 4000 }
        )
      }
      
    } catch (error: any) {
      console.error('Full sync failed:', error)
      setSyncStatus('Sync failed')
      setSyncProgress(0)
      
      const errorResult: SyncResult = {
        success: false,
        error: error.message,
        canRetry: !error.message.includes('authentication') && !error.message.includes('token'),
        needsReauth: error.message.includes('authentication') || error.message.includes('token')
      }
      
      setLastSyncResult(errorResult)
      
      if (errorResult.needsReauth) {
        toast.error('Canvas authentication failed. Please re-authenticate with Canvas.', { duration: 6000 })
      } else if (errorResult.canRetry) {
        toast.error(`Sync failed: ${error.message}. You can try again.`, { duration: 6000 })
      } else {
        toast.error(`Sync failed: ${error.message}`, { duration: 6000 })
      }
    } finally {
      setIsFullSyncing(false)
      setTimeout(() => {
        setSyncProgress(0)
        setSyncStatus('')
      }, 3000)
    }
  }

  const getSyncStatus = () => {
    if (isSyncing || isFullSyncing) return { text: 'Syncing...', color: 'blue', icon: RefreshCw }
    if (!hasData) return { text: 'No data', color: 'gray', icon: Database }
    if (lastSync) {
      const minutesAgo = Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60))
      return { 
        text: minutesAgo === 0 ? 'Just synced' : `${minutesAgo}m ago`, 
        color: 'green', 
        icon: CheckCircle 
      }
    }
    return { text: 'Cached data', color: 'green', icon: Database }
  }

  const status = getSyncStatus()
  const StatusIcon = status.icon

  // Card variant with enhanced features
  if (variant === 'card') {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-sage-200 shadow-soft hover:shadow-soft-hover transition-all duration-300 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-sage-600" />
              <CardTitle className="text-lg font-heading text-warm-gray-800">Canvas Sync</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs border-sage-300 text-sage-700">
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <CardDescription className="text-warm-gray-600">
            Keep your Canvas data fresh and up-to-date
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {(isFullSyncing) && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-warm-gray-600">{syncStatus}</span>
                <span className="text-warm-gray-500">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2 bg-sage-100" />
            </div>
          )}
          
          {showStats && hasData && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>📚 {courses.length} courses</span>
              <span>📝 {assignments.length} assignments</span>
              <span>📊 {grades.length} grades</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              onClick={performQuickSync}
              disabled={isSyncing || isFullSyncing}
              variant="outline"
              className="flex-1"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Quick Sync...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Quick Sync
                </>
              )}
            </Button>
            
            <Button
              onClick={performFullSync}
              disabled={isSyncing || isFullSyncing}
              className="flex-1 bg-sage-600 hover:bg-sage-700 text-white border-0 shadow-gentle hover:shadow-soft transition-all duration-300"
            >
              {isFullSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Full Sync...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Full Sync
                </>
              )}
            </Button>
          </div>
          
          {lastSyncResult && !isFullSyncing && !isSyncing && (
            <div className="mt-4 pt-3 border-t border-sage-100">
              {lastSyncResult.success ? (
                <div className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-green-700">
                    <div>Last sync successful</div>
                    {lastSyncResult.data && (
                      <div className="text-xs text-green-600 mt-1">
                        {lastSyncResult.data.courses} courses, {lastSyncResult.data.assignments} assignments
                      </div>
                    )}
                    {lastSyncResult.warnings && (
                      <div className="text-xs text-yellow-600 mt-1">
                        ⚠️ {lastSyncResult.warnings.message}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-red-700">
                    <div>Sync failed</div>
                    <div className="text-xs text-red-600 mt-1">{lastSyncResult.error}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Regular card variant (original)
  if (!showStats) {
    return (
      <Button
        onClick={performQuickSync}
        disabled={isSyncing || isFullSyncing}
        variant={variant as any}
        size={size}
        className={`${className} gap-2`}
      >
        <StatusIcon className={`w-4 h-4 ${(isSyncing || isFullSyncing) ? 'animate-spin' : ''}`} />
        {(isSyncing || isFullSyncing) ? 'Syncing...' : 'Sync Canvas Data'}
      </Button>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Canvas Data Sync</h3>
          </div>
          <Badge 
            variant="outline" 
            className={`
              ${status.color === 'blue' ? 'border-blue-300 text-blue-700' : ''}
              ${status.color === 'green' ? 'border-green-300 text-green-700' : ''}
              ${status.color === 'gray' ? 'border-gray-300 text-gray-700' : ''}
            `}
          >
            <StatusIcon className={`w-3 h-3 mr-1 ${(isSyncing || isFullSyncing) ? 'animate-spin' : ''}`} />
            {status.text}
          </Badge>
        </div>

        {hasData && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>📚 {courses.length} courses</span>
            <span>📝 {assignments.length} assignments</span>
            <span>📊 {grades.length} grades</span>
          </div>
        )}

        <Button
          onClick={performQuickSync}
          disabled={isSyncing || isFullSyncing}
          className="w-full gap-2"
          variant={hasData ? "outline" : "default"}
        >
          <RefreshCw className={`w-4 h-4 ${(isSyncing || isFullSyncing) ? 'animate-spin' : ''}`} />
          {(isSyncing || isFullSyncing) ? 'Syncing Canvas Data...' : hasData ? 'Refresh Data' : 'Sync Canvas Data'}
        </Button>

        {!hasData && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Click sync to load your Canvas data. Navigation between tabs will be instant after syncing.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
