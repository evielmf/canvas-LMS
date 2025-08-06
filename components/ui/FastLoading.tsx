'use client'

import { motion } from 'framer-motion'

interface FastLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FastLoadingSpinner({ size = 'md', className = '' }: FastLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-sage-200 border-t-sage-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

interface FastSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function FastSkeleton({ className = '', children }: FastSkeletonProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-warm-gray-100 via-warm-gray-50 to-warm-gray-100 rounded-lg ${className}`}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: '200% 100%' }}
    >
      {children}
    </motion.div>
  )
}

interface AssignmentCardSkeletonProps {
  count?: number
}

export function AssignmentCardSkeleton({ count = 3 }: AssignmentCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-gentle border border-warm-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <FastSkeleton className="h-4 w-3/4" />
              <FastSkeleton className="h-3 w-1/2" />
              <FastSkeleton className="h-3 w-1/3" />
            </div>
            <FastSkeleton className="h-8 w-20" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
