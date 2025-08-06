'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SyncConflictResolver } from './SyncConflictResolver'
import { SyncConflictAlert } from './SyncConflictAlert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHasConflicts } from '@/hooks/useSyncConflicts'
import { useState } from 'react'

export function SyncConflictSettingsPage() {
  const { data: conflictCheck } = useHasConflicts()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sync Management</h1>
        <p className="text-gray-600 mt-2">
          Manage synchronization between your Canvas LMS and cached data
        </p>
      </div>

      {/* Alert if conflicts exist */}
      <SyncConflictAlert onViewConflicts={() => setActiveTab('conflicts')} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conflicts" className="relative">
            Conflicts
            {conflictCheck?.hasConflicts && (
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SyncOverview />
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <SyncConflictResolver />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SyncSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SyncOverview() {
  const { data: conflictCheck, isLoading } = useHasConflicts()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync Status</CardTitle>
          <CardDescription>Current synchronization state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Last Sync:</span>
              <span className="text-sm text-gray-600">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span>Next Sync:</span>
              <span className="text-sm text-gray-600">In 15 minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`text-sm ${conflictCheck?.hasConflicts ? 'text-orange-600' : 'text-green-600'}`}>
                {isLoading ? 'Checking...' : conflictCheck?.hasConflicts ? 'Conflicts Detected' : 'Synchronized'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Summary</CardTitle>
          <CardDescription>Cached data statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Courses:</span>
              <span className="text-sm text-gray-600">5 courses</span>
            </div>
            <div className="flex justify-between">
              <span>Assignments:</span>
              <span className="text-sm text-gray-600">23 assignments</span>
            </div>
            <div className="flex justify-between">
              <span>Grades:</span>
              <span className="text-sm text-gray-600">18 graded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conflict Summary</CardTitle>
          <CardDescription>Data discrepancy overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Unresolved:</span>
              <span className={`text-sm ${conflictCheck?.hasConflicts ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                {isLoading ? '...' : conflictCheck?.count || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auto-resolved:</span>
              <span className="text-sm text-gray-600">3 today</span>
            </div>
            <div className="flex justify-between">
              <span>User-resolved:</span>
              <span className="text-sm text-gray-600">1 today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SyncSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automatic Sync</CardTitle>
          <CardDescription>Configure how often data is synchronized</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Background Sync</div>
                <div className="text-sm text-gray-600">Automatically sync data every 2 hours</div>
              </div>
              <div className="text-sm text-green-600">Enabled</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-resolve Safe Conflicts</div>
                <div className="text-sm text-gray-600">Automatically resolve timestamp and metadata conflicts</div>
              </div>
              <div className="text-sm text-green-600">Enabled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conflict Notifications</CardTitle>
          <CardDescription>How you want to be notified about conflicts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dashboard Alerts</div>
                <div className="text-sm text-gray-600">Show alerts on dashboard when conflicts are detected</div>
              </div>
              <div className="text-sm text-green-600">Enabled</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-600">Send email when critical conflicts are detected</div>
              </div>
              <div className="text-sm text-gray-600">Disabled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
