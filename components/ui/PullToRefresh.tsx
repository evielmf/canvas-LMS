'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  disabled?: boolean
}

export default function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const threshold = 80 // Distance needed to trigger refresh

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || window.scrollY > 0) return
    setStartY(e.touches[0].clientY)
    setIsPulling(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || disabled || window.scrollY > 0) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY) * 0.4) // Dampen the pull
    
    if (distance > 0) {
      e.preventDefault() // Prevent default scroll behavior
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }

  const handleTouchEnd = () => {
    if (!isPulling || disabled) return
    
    setIsPulling(false)
    
    if (pullDistance >= threshold) {
      triggerRefresh()
    } else {
      setPullDistance(0)
    }
  }

  const triggerRefresh = async () => {
    setIsRefreshing(true)
    setPullDistance(threshold)
    
    try {
      await onRefresh()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, startY, pullDistance, disabled])

  const getRefreshStatus = () => {
    if (isRefreshing) return 'Refreshing...'
    if (pullDistance >= threshold) return 'Release to refresh'
    if (pullDistance > 0) return 'Pull to refresh'
    return ''
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center bg-sage-50 transition-all duration-300 ease-out z-10"
        style={{ 
          transform: `translateY(${pullDistance - threshold}px)`,
          height: threshold,
          opacity: pullDistance > 0 ? 1 : 0
        }}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-sage-600 text-white mb-2 transition-transform duration-300 ${
          isRefreshing ? 'animate-spin' : pullDistance >= threshold ? 'scale-110' : 'scale-100'
        }`}>
          <RefreshCw className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-sage-700">
          {getRefreshStatus()}
        </span>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-300 ease-out"
        style={{ 
          transform: `translateY(${pullDistance}px)` 
        }}
      >
        {children}
      </div>
    </div>
  )
}
