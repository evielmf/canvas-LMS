'use client'

interface DashboardClientWrapperProps {
  children: React.ReactNode
}

export default function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  // Removed automatic prefetching - data will only be fetched via manual sync button
  // This prevents automatic API calls on every page load/tab switch
  
  return <>{children}</>
}
