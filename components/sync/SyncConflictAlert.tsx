'use client'

import { AlertTriangle, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useHasConflicts } from '@/hooks/useSyncConflicts'
import { useState } from 'react'

interface SyncConflictAlertProps {
  onViewConflicts?: () => void
}

export function SyncConflictAlert({ onViewConflicts }: SyncConflictAlertProps) {
  const { data: conflictCheck, isLoading } = useHasConflicts()
  const [dismissed, setDismissed] = useState(false)

  if (isLoading || !conflictCheck?.hasConflicts || dismissed) {
    return null
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <AlertDescription className="text-orange-800">
            <div className="flex items-center gap-2">
              <span>Sync conflicts detected between your cached data and Canvas.</span>
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                {conflictCheck.count} conflicts
              </Badge>
            </div>
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {onViewConflicts && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onViewConflicts}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Review Conflicts
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-orange-600 hover:bg-orange-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Compact version for use in headers or sidebars
 */
export function SyncConflictBadge({ onClickAction }: { onClickAction?: () => void }) {
  const { data: conflictCheck, isLoading } = useHasConflicts()

  if (isLoading || !conflictCheck?.hasConflicts) {
    return null
  }

  return (
    <Badge 
      variant="destructive" 
      className="cursor-pointer animate-pulse"
      onClick={onClickAction}
    >
      <AlertTriangle className="h-3 w-3 mr-1" />
      {conflictCheck.count} conflicts
    </Badge>
  )
}
