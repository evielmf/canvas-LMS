'use client'

import { useEffect, useRef } from 'react'
import { useCanvasSync } from '@/hooks/useCanvasSync'
import { RefreshCw, Database, Clock, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function SyncStatusWidget() {
  const {
    syncStatus,
    statusLoading,
    triggerSync,
    triggerAutoSync,
    isSyncing,
    getSyncStatusText,
    getCacheSummary
  } = useCanvasSync()
  
  // Use ref to prevent infinite loops
  const hasTriggeredAutoSync = useRef(false)

  const cacheSummary = getCacheSummary()
  const syncStatusText = getSyncStatusText()

  // Auto-trigger sync if needed (only once per component mount)
  useEffect(() => {
    if (syncStatus?.needsSync && !isSyncing && !statusLoading && !hasTriggeredAutoSync.current) {
      console.log('🔄 Auto-triggering sync from SyncStatusWidget')
      hasTriggeredAutoSync.current = true
      triggerAutoSync()
    }
  }, [syncStatus?.needsSync, isSyncing, statusLoading, triggerAutoSync])

  // Reset the flag when sync completes
  useEffect(() => {
    if (!syncStatus?.needsSync) {
      hasTriggeredAutoSync.current = false
    }
  }, [syncStatus?.needsSync])

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    }
    
    if (!syncStatus?.lastSync) {
      return <WifiOff className="h-4 w-4 text-red-500" />
    }
    
    if (syncStatus.needsSync) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = () => {
    if (isSyncing) return 'text-blue-600'
    if (!syncStatus?.lastSync) return 'text-red-600'
    if (syncStatus.needsSync) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (statusLoading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Canvas Sync</h3>
            <p className={`text-xs ${getStatusColor()}`}>
              {isSyncing ? 'Syncing...' : syncStatusText}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Cache info */}
          {cacheSummary && !cacheSummary.isEmpty && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Database className="h-3 w-3" />
              <span>{cacheSummary.total} cached</span>
            </div>
          )}

          {/* Manual sync button */}
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            title="Manually sync Canvas data"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Detailed status */}
      {cacheSummary && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Courses:</span>
              <span className="font-medium">{cacheSummary.courses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Assignments:</span>
              <span className="font-medium">{cacheSummary.assignments}</span>
            </div>
          </div>
          
          {syncStatus?.canvasUrl && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Wifi className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 truncate">
                  {syncStatus.canvasUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {cacheSummary?.isEmpty && !isSyncing && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <Database className="h-6 w-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">No Canvas data cached</p>
            <button
              onClick={triggerSync}
              className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
