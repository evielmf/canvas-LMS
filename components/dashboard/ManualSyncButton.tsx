'use client'

import { useState } from 'react'
import { useCanvasDataCached } from '@/hooks/useCanvasDataCached'
import { RefreshCw, Database, CheckCircle, AlertCircle, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface ManualSyncButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showStats?: boolean
}

export default function ManualSyncButton({ 
  className = '',
  variant = 'default',
  size = 'default',
  showStats = true
}: ManualSyncButtonProps) {
  const { syncData, hasData, courses, assignments, grades } = useCanvasDataCached()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const handleSync = async () => {
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
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Sync failed. Please check your Canvas connection.', { 
        id: 'sync-toast',
        duration: 6000 
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getSyncStatus = () => {
    if (isSyncing) return { text: 'Syncing...', color: 'blue', icon: RefreshCw }
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

  if (!showStats) {
    return (
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant={variant}
        size={size}
        className={`${className} gap-2`}
      >
        <StatusIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Canvas Data'}
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
            <StatusIcon className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
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
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full gap-2"
          variant={hasData ? "outline" : "default"}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing Canvas Data...' : hasData ? 'Refresh Data' : 'Sync Canvas Data'}
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
