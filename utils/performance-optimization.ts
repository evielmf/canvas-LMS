/**
 * Performance Optimization Utilities for Canvas LMS Dashboard
 * Implements multiple caching strategies and performance monitoring
 */

import { QueryClient } from '@tanstack/react-query'

// Performance metrics tracking
interface PerformanceMetrics {
  apiCalls: number
  cacheHits: number
  cacheMisses: number
  avgResponseTime: number
  lastUpdated: Date
}

class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    lastUpdated: new Date()
  }

  private responseTimes: number[] = []

  recordApiCall(responseTime: number, fromCache: boolean = false) {
    this.metrics.apiCalls++
    this.responseTimes.push(responseTime)
    
    if (fromCache) {
      this.metrics.cacheHits++
    } else {
      this.metrics.cacheMisses++
    }

    // Calculate rolling average of last 50 calls
    if (this.responseTimes.length > 50) {
      this.responseTimes = this.responseTimes.slice(-50)
    }
    
    this.metrics.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
    this.metrics.lastUpdated = new Date()

    // Log performance warnings
    if (responseTime > 3000 && !fromCache) {
      console.warn(`⚠️ Slow API call detected: ${responseTime.toFixed(0)}ms`)
    }
    
    if (responseTime < 100 && fromCache) {
      console.log(`⚡ Fast cache hit: ${responseTime.toFixed(0)}ms`)
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses
    return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0
  }

  reset() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      lastUpdated: new Date()
    }
    this.responseTimes = []
  }
}

// Global performance tracker
export const performanceTracker = new PerformanceTracker()

// Optimized fetch wrapper with performance tracking
export const optimizedFetch = async (
  url: string, 
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> => {
  const startTime = performance.now()
  const controller = new AbortController()
  
  // Set timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    console.time(`FETCH_${url}`)
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    console.timeEnd(`FETCH_${url}`)
    
    // Track performance
    const fromCache = response.headers.get('x-cache') === 'HIT' || 
                     response.headers.get('cached') === 'true'
    performanceTracker.recordApiCall(responseTime, fromCache)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
    
  } catch (error) {
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    performanceTracker.recordApiCall(responseTime, false)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// React Query optimizations
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive caching for better performance
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        
        // Reduce unnecessary refetches
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        
        // Smart retry logic
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.message?.includes('401') || error?.message?.includes('403')) {
            return false
          }
          
          // Don't retry on network errors after 2 attempts
          if (error?.message?.includes('fetch') && failureCount >= 2) {
            return false
          }
          
          return failureCount < 3
        },
        
        // Exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      }
    }
  })
}

// Preloading utilities
export const preloadCriticalData = async (queryClient: QueryClient, userId: string) => {
  const startTime = performance.now()
  
  console.log('🚀 Preloading critical Canvas data...')
  
  try {
    // Preload in order of importance
    const promises = [
      // Most important - courses (needed for navigation)
      queryClient.prefetchQuery({
        queryKey: ['canvas-courses', userId],
        queryFn: () => optimizedFetch('/api/canvas/courses').then(r => r.json()),
        staleTime: 30 * 60 * 1000,
      }),
      
      // Second - assignments (frequently accessed)
      queryClient.prefetchQuery({
        queryKey: ['canvas-assignments', userId],
        queryFn: () => optimizedFetch('/api/canvas/assignments').then(r => r.json()),
        staleTime: 15 * 60 * 1000,
      }),
      
      // Third - grades (less critical for initial load)
      queryClient.prefetchQuery({
        queryKey: ['canvas-grades', userId],
        queryFn: () => optimizedFetch('/api/canvas/grades').then(r => r.json()),
        staleTime: 10 * 60 * 1000,
      })
    ]
    
    await Promise.allSettled(promises)
    
    const totalTime = performance.now() - startTime
    console.log(`✅ Critical data preloaded in ${totalTime.toFixed(1)}ms`)
    
  } catch (error) {
    console.error('❌ Preload failed:', error)
  }
}

// Background refresh for stale data
export const backgroundRefreshStaleData = async (queryClient: QueryClient, userId: string) => {
  console.log('🔄 Checking for stale data to refresh...')
  
  const queries = queryClient.getQueryCache().getAll()
  const staleQueries = queries.filter(query => {
    const isUserQuery = query.queryKey.includes(userId)
    const isStale = query.isStale()
    const hasData = !!query.state.data
    
    return isUserQuery && isStale && hasData
  })
  
  if (staleQueries.length > 0) {
    console.log(`🔄 Refreshing ${staleQueries.length} stale queries in background`)
    
    const refreshPromises = staleQueries.map(query => 
      queryClient.invalidateQueries({ queryKey: query.queryKey })
    )
    
    await Promise.allSettled(refreshPromises)
  }
}

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    const used = Math.round(memory.usedJSHeapSize / 1048576) // MB
    const total = Math.round(memory.totalJSHeapSize / 1048576) // MB
    
    console.log(`💾 Memory usage: ${used}MB / ${total}MB`)
    
    // Warn if memory usage is high
    if (used > 100) {
      console.warn(`⚠️ High memory usage detected: ${used}MB`)
    }
    
    return { used, total, percentage: (used / total) * 100 }
  }
  
  return null
}

// Development performance reporting
export const generatePerformanceReport = (): string => {
  const metrics = performanceTracker.getMetrics()
  const hitRate = performanceTracker.getCacheHitRate()
  const memory = monitorMemoryUsage()
  
  const report = `
📊 CANVAS DASHBOARD PERFORMANCE REPORT
=====================================

🚀 API Performance:
   • Total API calls: ${metrics.apiCalls}
   • Cache hit rate: ${hitRate.toFixed(1)}%
   • Avg response time: ${metrics.avgResponseTime.toFixed(0)}ms
   • Cache hits: ${metrics.cacheHits}
   • Cache misses: ${metrics.cacheMisses}

💾 Memory Usage:
   ${memory ? `• Used: ${memory.used}MB (${memory.percentage.toFixed(1)}%)` : '• Not available'}

⏰ Last updated: ${metrics.lastUpdated.toLocaleTimeString()}

🎯 Performance Goals:
   • API responses: < 1000ms ✅
   • Cache hit rate: > 80% ${hitRate > 80 ? '✅' : '❌'}
   • Dashboard load: < 3000ms
  `
  
  return report
}

// Export performance tools for debugging
export const performanceTools = {
  tracker: performanceTracker,
  generateReport: generatePerformanceReport,
  monitorMemory: monitorMemoryUsage,
  preloadData: preloadCriticalData,
  backgroundRefresh: backgroundRefreshStaleData
}

// Console command for development
if (typeof window !== 'undefined') {
  (window as any).canvasPerf = performanceTools
  console.log('🔧 Canvas performance tools available at window.canvasPerf')
}
