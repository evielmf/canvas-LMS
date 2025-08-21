'use client'

import { useCanvasDataCached } from '@/hooks/useCanvasDataCached'
import { useSupabase } from '@/app/providers'

export default function CanvasDataDebug() {
  const { user } = useSupabase()
  const { 
    courses, 
    assignments, 
    grades, 
    hasData, 
    hasCoursesData, 
    hasAssignmentsData, 
    hasGradesData,
    loading,
    coursesLoading,
    assignmentsLoading,
    gradesLoading,
    error
  } = useCanvasDataCached()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">Canvas Data Cache Debug</div>
      
      <div className="space-y-1">
        <div>User: {user?.id ? 'Logged in' : 'Not logged in'}</div>
        <div>Overall Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Overall HasData: {hasData ? 'Yes' : 'No'}</div>
        
        <hr className="my-2 border-gray-600" />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="font-semibold">Courses:</div>
            <div>Count: {courses?.length || 0}</div>
            <div>Loading: {coursesLoading ? 'Yes' : 'No'}</div>
            <div>HasData: {hasCoursesData ? 'Yes' : 'No'}</div>
          </div>
          
          <div>
            <div className="font-semibold">Assignments:</div>
            <div>Count: {assignments?.length || 0}</div>
            <div>Loading: {assignmentsLoading ? 'Yes' : 'No'}</div>
            <div>HasData: {hasAssignmentsData ? 'Yes' : 'No'}</div>
          </div>
          
          <div>
            <div className="font-semibold">Grades:</div>
            <div>Count: {grades?.length || 0}</div>
            <div>Loading: {gradesLoading ? 'Yes' : 'No'}</div>
            <div>HasData: {hasGradesData ? 'Yes' : 'No'}</div>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-600 rounded">
            Error: {error.message}
          </div>
        )}
      </div>
    </div>
  )
}
