'use client'

import { motion } from 'framer-motion'
import { BookOpen, Calendar, BarChart3, TrendingUp } from 'lucide-react'

interface OptimizedLoadingProps {
  type?: 'assignments' | 'grades' | 'schedule' | 'analytics' | 'dashboard'
  message?: string
}

export default function OptimizedLoading({ 
  type = 'dashboard', 
  message = 'Loading your peaceful study space...' 
}: OptimizedLoadingProps) {
  const getIcon = () => {
    switch (type) {
      case 'assignments':
        return BookOpen
      case 'schedule':
        return Calendar
      case 'grades':
        return BarChart3
      case 'analytics':
        return TrendingUp
      default:
        return BookOpen
    }
  }

  const Icon = getIcon()

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-sage-100 to-sage-200 rounded-2xl flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-8 h-8 text-sage-600" />
        </motion.div>
        
        <motion.h3 
          className="text-lg font-heading font-medium text-warm-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.h3>
        
        <motion.p 
          className="text-sm text-warm-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          This should only take a moment...
        </motion.p>

        {/* Animated dots */}
        <motion.div 
          className="flex justify-center space-x-1 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-sage-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// Specialized loading for different sections
export function AssignmentsLoading() {
  return (
    <OptimizedLoading 
      type="assignments" 
      message="Loading your assignments..." 
    />
  )
}

export function GradesLoading() {
  return (
    <OptimizedLoading 
      type="grades" 
      message="Loading your grades..." 
    />
  )
}

export function ScheduleLoading() {
  return (
    <OptimizedLoading 
      type="schedule" 
      message="Loading your schedule..." 
    />
  )
}

export function AnalyticsLoading() {
  return (
    <OptimizedLoading 
      type="analytics" 
      message="Loading your analytics..." 
    />
  )
}
