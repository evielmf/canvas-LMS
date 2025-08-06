'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight, Square, CheckSquare } from 'lucide-react'
import { useSyncConflicts, SyncConflict } from '@/hooks/useSyncConflicts'

export function SyncConflictResolver() {
  const {
    conflicts,
    summary,
    hasUnresolvedConflicts,
    isLoading,
    error,
    resolveConflict,
    ignoreConflict,
    batchResolve,
    batchIgnore,
    isResolving,
    isIgnoring,
    isBatchResolving,
    isBatchIgnoring,
  } = useSyncConflicts()

  const [selectedConflicts, setSelectedConflicts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('unresolved')

  // Filter conflicts by status
  const unresolvedConflicts = conflicts.filter(c => c.status === 'unresolved')
  const resolvedConflicts = conflicts.filter(c => c.status === 'resolved')
  const ignoredConflicts = conflicts.filter(c => c.status === 'ignored')

  const handleSelectConflict = (conflictId: string, checked: boolean) => {
    if (checked) {
      setSelectedConflicts(prev => [...prev, conflictId])
    } else {
      setSelectedConflicts(prev => prev.filter(id => id !== conflictId))
    }
  }

  const handleSelectAll = (conflicts: SyncConflict[], checked: boolean) => {
    if (checked) {
      const ids = conflicts.map(c => c.id)
      setSelectedConflicts(prev => {
        const uniqueIds = new Set([...prev, ...ids])
        return Array.from(uniqueIds)
      })
    } else {
      const ids = conflicts.map(c => c.id)
      setSelectedConflicts(prev => prev.filter(id => !ids.includes(id)))
    }
  }

  const handleResolveConflict = async (conflictId: string) => {
    try {
      await resolveConflict(conflictId)
      console.log('Conflict resolved successfully')
    } catch (error: any) {
      console.error('Failed to resolve conflict:', error.message)
    }
  }

  const handleIgnoreConflict = async (conflictId: string) => {
    try {
      await ignoreConflict(conflictId)
      console.log('Conflict ignored successfully')
    } catch (error: any) {
      console.error('Failed to ignore conflict:', error.message)
    }
  }

  const handleBatchResolve = async () => {
    if (selectedConflicts.length === 0) return
    
    try {
      await batchResolve(selectedConflicts)
      setSelectedConflicts([])
      console.log(`Resolved ${selectedConflicts.length} conflicts`)
    } catch (error: any) {
      console.error('Failed to batch resolve conflicts:', error.message)
    }
  }

  const handleBatchIgnore = async () => {
    if (selectedConflicts.length === 0) return
    
    try {
      await batchIgnore(selectedConflicts)
      setSelectedConflicts([])
      console.log(`Ignored ${selectedConflicts.length} conflicts`)
    } catch (error: any) {
      console.error('Failed to batch ignore conflicts:', error.message)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Checking for Sync Conflicts...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load sync conflicts: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasUnresolvedConflicts && activeTab === 'unresolved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            All Data Synchronized
          </CardTitle>
          <CardDescription>
            No sync conflicts detected. Your Canvas data is up to date.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Sync Conflicts Detected
        </CardTitle>
        <CardDescription>
          Inconsistencies found between cached data and Canvas. Review and resolve below.
        </CardDescription>
        
        {/* Summary Stats */}
        <div className="flex gap-2 mt-2">
          <Badge variant="destructive">
            {summary.total_unresolved || 0} Unresolved
          </Badge>
          <Badge variant="secondary">
            {summary.total_resolved || 0} Resolved
          </Badge>
          <Badge variant="outline">
            {summary.total_ignored || 0} Ignored
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unresolved">
              Unresolved ({unresolvedConflicts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedConflicts.length})
            </TabsTrigger>
            <TabsTrigger value="ignored">
              Ignored ({ignoredConflicts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unresolved" className="space-y-4">
            {unresolvedConflicts.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(unresolvedConflicts, true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConflicts([])}
                >
                  Clear Selection
                </Button>
                {selectedConflicts.length > 0 && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleBatchResolve}
                      disabled={isBatchResolving}
                    >
                      Resolve Selected ({selectedConflicts.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBatchIgnore}
                      disabled={isBatchIgnoring}
                    >
                      Ignore Selected ({selectedConflicts.length})
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              {unresolvedConflicts.map((conflict) => (
                <ConflictCard
                  key={conflict.id}
                  conflict={conflict}
                  selected={selectedConflicts.includes(conflict.id)}
                  onSelect={(checked) => handleSelectConflict(conflict.id, checked)}
                  onResolve={() => handleResolveConflict(conflict.id)}
                  onIgnore={() => handleIgnoreConflict(conflict.id)}
                  isResolving={isResolving}
                  isIgnoring={isIgnoring}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-3">
            {resolvedConflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                readonly
              />
            ))}
          </TabsContent>

          <TabsContent value="ignored" className="space-y-3">
            {ignoredConflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                readonly
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface ConflictCardProps {
  conflict: SyncConflict
  selected?: boolean
  onSelect?: (checked: boolean) => void
  onResolve?: () => void
  onIgnore?: () => void
  isResolving?: boolean
  isIgnoring?: boolean
  readonly?: boolean
}

function ConflictCard({
  conflict,
  selected = false,
  onSelect,
  onResolve,
  onIgnore,
  isResolving = false,
  isIgnoring = false,
  readonly = false
}: ConflictCardProps) {
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return '📝'
      case 'course': return '📚'
      case 'grade': return '📊'
      default: return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600'
      case 'ignored': return 'text-gray-500'
      default: return 'text-orange-600'
    }
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string' && value === '') return '(empty)'
    return String(value)
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {!readonly && onSelect && (
            <button
              onClick={() => onSelect(!selected)}
              className="mt-1 w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
            >
              {selected ? <CheckSquare className="h-3 w-3 text-blue-600" /> : <Square className="h-3 w-3 text-gray-400" />}
            </button>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getItemTypeIcon(conflict.item_type)}</span>
              <Badge variant="outline" className="capitalize">
                {conflict.item_type}
              </Badge>
              <Badge 
                variant={conflict.status === 'resolved' ? 'default' : 'secondary'}
                className={getStatusColor(conflict.status)}
              >
                {conflict.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Field:</strong> {conflict.field} • <strong>Item ID:</strong> {conflict.item_id}
            </div>
            <div className="text-xs text-gray-500">
              Detected: {new Date(conflict.detected_at).toLocaleString()}
              {conflict.resolved_at && (
                <> • Resolved: {new Date(conflict.resolved_at).toLocaleString()}</>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="font-medium text-blue-600">Cached Value:</div>
          <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-200">
            <code className="text-xs">{formatValue(conflict.cached_value)}</code>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-green-600">Live Canvas Value:</div>
          <div className="bg-green-50 p-2 rounded border-l-4 border-green-200">
            <code className="text-xs">{formatValue(conflict.live_value)}</code>
          </div>
        </div>
      </div>

      {!readonly && conflict.status === 'unresolved' && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={onResolve}
            disabled={isResolving || isIgnoring}
            className="flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            Accept Canvas Value
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onIgnore}
            disabled={isResolving || isIgnoring}
            className="flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Keep Cached Value
          </Button>
        </div>
      )}
    </div>
  )
}
