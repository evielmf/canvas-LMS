'use client'

import { useUniversalPrefetch } from '@/hooks/useUniversalPrefetch'
import { useEffect } from 'react'

interface DashboardClientWrapperProps {
  children: React.ReactNode
}

export default function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  const { prefetchAllCanvasData } = useUniversalPrefetch()

  useEffect(() => {
    // Aggressively prefetch all Canvas data when dashboard loads
    // This ensures instant tab switching
    const prefetchTimeout = setTimeout(() => {
      prefetchAllCanvasData()
      console.log('🚀 Dashboard: Prefetching all Canvas data for instant navigation')
    }, 100) // Small delay to not block initial render

    return () => clearTimeout(prefetchTimeout)
  }, [prefetchAllCanvasData])

  return <>{children}</>
}
