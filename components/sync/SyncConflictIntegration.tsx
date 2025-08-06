'use client'

import { useState } from 'react'
import { SyncConflictAlert, SyncConflictBadge } from './SyncConflictAlert'
import { SyncConflictResolver } from './SyncConflictResolver'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useHasConflicts } from '@/hooks/useSyncConflicts'

/**
 * Component to be added to the main dashboard
 * Shows conflict alerts and provides quick access to conflict resolution
 */
export function DashboardSyncConflictIntegration() {
  const { data: conflictCheck } = useHasConflicts()
  const [showResolver, setShowResolver] = useState(false)

  if (!conflictCheck?.hasConflicts) {
    return null
  }

  if (showResolver) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Resolve Sync Conflicts</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolver(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">
            <SyncConflictResolver />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <SyncConflictAlert onViewConflicts={() => setShowResolver(true)} />
    </div>
  )
}

/**
 * Component for header/navigation integration
 * Shows a small badge that opens the conflict resolver when clicked
 */
export function HeaderSyncConflictBadge() {
  const [showResolver, setShowResolver] = useState(false)

  if (showResolver) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Resolve Sync Conflicts</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolver(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">
            <SyncConflictResolver />
          </div>
        </div>
      </div>
    )
  }

  return <SyncConflictBadge onClickAction={() => setShowResolver(true)} />
}

/**
 * Compact version for settings page or dedicated sync management area
 */
export function SettingsSyncConflictSection() {
  return (
    <div className="space-y-4">
      <SyncConflictAlert />
      <SyncConflictResolver />
    </div>
  )
}
