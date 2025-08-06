'use client'

import { useState, useEffect } from 'react'
import { useCanvasData } from '@/hooks/useCanvasData'

interface PerformanceMetrics {
  loadTime: number
  dataCount: number
  cacheHit: boolean
  timestamp: string
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const { courses, assignments, grades, loading, refetch } = useCanvasData()

  useEffect(() => {
    if (!loading && (courses.length > 0 || assignments.length > 0 || grades.length > 0)) {
      const performanceEntries = performance.getEntriesByType('navigation')
      const loadTime = performanceEntries.length > 0 ? performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart : 0
      
      const newMetric: PerformanceMetrics = {
        loadTime: loadTime || performance.now(),
        dataCount: courses.length + assignments.length + grades.length,
        cacheHit: true, // Assuming cache hit if data loads quickly
        timestamp: new Date().toLocaleTimeString()
      }
      
      setMetrics(prev => [newMetric, ...prev.slice(0, 9)]) // Keep last 10 metrics
    }
  }, [loading, courses.length, assignments.length, grades.length])

  const testPerformance = async () => {
    const startTime = performance.now()
    console.log('🧪 Starting performance test...')
    
    try {
      await refetch()
      const endTime = performance.now()
      const testTime = endTime - startTime
      
      const testMetric: PerformanceMetrics = {
        loadTime: testTime,
        dataCount: courses.length + assignments.length + grades.length,
        cacheHit: testTime < 1000, // Consider it cache hit if under 1 second
        timestamp: new Date().toLocaleTimeString()
      }
      
      setMetrics(prev => [testMetric, ...prev.slice(0, 9)])
      console.log(`⚡ Performance test completed in ${testTime.toFixed(1)}ms`)
    } catch (error) {
      console.error('❌ Performance test failed:', error)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
      >
        📊 Performance
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={testPerformance}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
        >
          🧪 Test Performance
        </button>
        
        <div className="text-xs text-gray-600">
          <div>Data: {courses.length} courses, {assignments.length} assignments, {grades.length} grades</div>
          <div>Status: {loading ? '⏳ Loading...' : '✅ Loaded'}</div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Recent Tests:</h4>
          {metrics.length === 0 ? (
            <div className="text-xs text-gray-500">No tests yet</div>
          ) : (
            metrics.map((metric, index) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                  <span className={metric.cacheHit ? 'text-green-600' : 'text-orange-600'}>
                    {metric.cacheHit ? '⚡ Fast' : '🐌 Slow'}
                  </span>
                  <span>{metric.timestamp}</span>
                </div>
                <div className="text-gray-600">
                  {metric.loadTime.toFixed(1)}ms • {metric.dataCount} items
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-xs text-gray-500 border-t pt-2">
          💡 Target: &lt;1s for cached data, &lt;3s for fresh data
        </div>
      </div>
    </div>
  )
}
