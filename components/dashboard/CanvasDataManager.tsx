'use client'

import { useEffect, useState } from 'react'
import { useCanvasSync } from '@/hooks/useCanvasSync'
import { useCanvasToken } from '@/hooks/useCanvasToken'
import { useSupabase } from '@/app/providers'
import { RefreshCw, Cloud, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CanvasDataManagerProps {
  autoSync?: boolean
  showSyncButton?: boolean
  compact?: boolean
}

export default function CanvasDataManager({ 
  autoSync = true, 
  showSyncButton = true,
  compact = false 
}: CanvasDataManagerProps) {
  const { user } = useSupabase()
  const { hasToken } = useCanvasToken()
  const { 
    syncStatus, 
    triggerSync, 
    triggerAutoSync, 
    isSyncing, 
    getSyncStatusText,
    getCacheSummary 
  } = useCanvasSync()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user && hasToken && autoSync && syncStatus?.needsSync && !isSyncing) {
      console.log('Auto-triggering Canvas sync from CanvasDataManager...')
      triggerAutoSync()
    }
  }, [mounted, user, hasToken, autoSync, syncStatus?.needsSync, isSyncing, triggerAutoSync])

  const handleManualSync = () => {
    triggerSync()
  }

  if (!mounted || !user || !hasToken) {
    return null
  }

  const cacheSummary = getCacheSummary()
  const syncStatusText = getSyncStatusText()
  const needsSync = syncStatus?.needsSync || false

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className={`flex items-center space-x-1 ${needsSync ? 'text-orange-600' : 'text-green-600'}`}>
          {needsSync ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          <span className="text-xs">
            {needsSync ? 'Sync needed' : syncStatusText}
          </span>
        </div>
        
        {showSyncButton && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            title="Sync Canvas data"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${needsSync ? 'bg-orange-100' : 'bg-green-100'}`}>
            <Cloud className={`w-5 h-5 ${needsSync ? 'text-orange-600' : 'text-green-600'}`} />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Canvas Data Sync</h3>
            <p className="text-sm text-gray-500">
              {needsSync 
                ? 'Canvas data needs to be synced'
                : `Last synced ${syncStatusText}`
              }
            </p>
            {cacheSummary && (
              <p className="text-xs text-gray-400">
                {cacheSummary.courses} courses, {cacheSummary.assignments} assignments cached
              </p>
            )}
          </div>
        </div>

        {showSyncButton && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
              isSyncing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : needsSync
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : needsSync ? 'Sync Now' : 'Refresh'}
          </button>
        )}
      </div>

      {needsSync && (
        <div className="mt-3 p-3 bg-orange-50 rounded-md">
          <p className="text-sm text-orange-700">
            Your Canvas data is out of date. Sync now to get the latest assignments and grades.
          </p>
        </div>
      )}
    </div>
  )
}
