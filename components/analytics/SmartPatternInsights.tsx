'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Clock, Calendar, Target, Lightbulb, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CanvasAssignment } from '@/hooks/useCanvasDataCached'

interface StudySession {
  id: string
  course_id?: string
  course_name?: string
  duration_minutes: number
  activity_type: string
  started_at: string
  completed_at?: string
}

interface SmartPatternInsightsProps {
  assignments?: CanvasAssignment[]
  sessions?: StudySession[]
  loading?: boolean
}

interface Pattern {
  type: 'time' | 'day' | 'course' | 'performance' | 'habit'
  icon: any
  title: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestion?: string
}

export default function SmartPatternInsights({ 
  assignments, 
  sessions, 
  loading 
}: SmartPatternInsightsProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Smart Pattern Insights</CardTitle>
          </div>
          <CardDescription>AI-powered analysis of your study behaviors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-soft-pulse space-y-4">
            <div className="h-6 bg-sage-100 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-sage-50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-sage-100 shadow-soft">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Smart Pattern Insights</CardTitle>
          </div>
          <CardDescription>AI-powered analysis of your study behaviors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-soft-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-sage-50 rounded-xl"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Analyze patterns from assignments and sessions
  const analyzePatterns = (): Pattern[] => {
    const patterns: Pattern[] = []

    if (!assignments || assignments.length === 0) {
      return [{
        type: 'habit',
        icon: Lightbulb,
        title: 'Start Building Study Patterns',
        description: 'Complete a few assignments to unlock personalized insights',
        confidence: 'high',
        actionable: true,
        suggestion: 'Sync your Canvas data to begin pattern analysis'
      }]
    }

    // Analyze submission times
    const submissionTimes = assignments
      .filter(a => a.submission?.submitted_at)
      .map(a => new Date(a.submission!.submitted_at!))
      .map(date => date.getHours())

    if (submissionTimes.length >= 5) {
      const avgHour = submissionTimes.reduce((sum, hour) => sum + hour, 0) / submissionTimes.length
      const lateSubmissions = submissionTimes.filter(hour => hour >= 22 || hour <= 6).length
      
      if (lateSubmissions > submissionTimes.length * 0.6) {
        patterns.push({
          type: 'time',
          icon: Clock,
          title: 'Night Owl Study Pattern',
          description: `You submit ${Math.round((lateSubmissions / submissionTimes.length) * 100)}% of assignments late at night`,
          confidence: 'high',
          actionable: true,
          suggestion: 'Consider starting assignments earlier to reduce late-night stress'
        })
      } else if (avgHour >= 9 && avgHour <= 17) {
        patterns.push({
          type: 'time',
          icon: Clock,
          title: 'Productive Daytime Worker',
          description: 'You consistently submit work during optimal daytime hours',
          confidence: 'high',
          actionable: false
        })
      }
    }

    // Analyze day-of-week patterns
    const submissionDays = assignments
      .filter(a => a.submission?.submitted_at)
      .map(a => new Date(a.submission!.submitted_at!).getDay())

    if (submissionDays.length >= 5) {
      const dayCount = new Map<number, number>()
      submissionDays.forEach(day => {
        dayCount.set(day, (dayCount.get(day) || 0) + 1)
      })

      const mostActiveDay = Array.from(dayCount.entries())
        .sort((a, b) => b[1] - a[1])[0]

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      if (mostActiveDay && mostActiveDay[1] > submissionDays.length * 0.3) {
        patterns.push({
          type: 'day',
          icon: Calendar,
          title: `${dayNames[mostActiveDay[0]]} Power Day`,
          description: `${Math.round((mostActiveDay[1] / submissionDays.length) * 100)}% of your submissions happen on ${dayNames[mostActiveDay[0]]}s`,
          confidence: 'high',
          actionable: true,
          suggestion: `Schedule important work on ${dayNames[mostActiveDay[0]]}s when you're most productive`
        })
      }

      // Check for procrastination pattern (Sunday submissions)
      const sundaySubmissions = dayCount.get(0) || 0
      if (sundaySubmissions > submissionDays.length * 0.4) {
        patterns.push({
          type: 'habit',
          icon: AlertTriangle,
          title: 'Weekend Rush Pattern',
          description: 'You tend to complete assignments on Sundays, possibly rushing',
          confidence: 'medium',
          actionable: true,
          suggestion: 'Try spreading work throughout the week to reduce Sunday stress'
        })
      }
    }

    // Analyze grade patterns
    const gradedAssignments = assignments.filter(a => a.submission?.score !== null && a.submission?.score !== undefined)
    
    if (gradedAssignments.length >= 3) {
      const scores = gradedAssignments.map(a => {
        const score = a.submission!.score!
        const possible = a.points_possible || 100
        return (score / possible) * 100
      })

      const recentScores = scores.slice(-3)
      const isImproving = recentScores[2] > recentScores[0]
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

      if (isImproving && recentScores[2] > recentScores[0] + 5) {
        patterns.push({
          type: 'performance',
          icon: TrendingUp,
          title: 'Upward Grade Trajectory',
          description: `Your recent grades are improving by ${(recentScores[2] - recentScores[0]).toFixed(1)} points`,
          confidence: 'high',
          actionable: false
        })
      }

      if (avgScore >= 90) {
        patterns.push({
          type: 'performance',
          icon: Target,
          title: 'Consistent High Performer',
          description: `Maintaining a ${avgScore.toFixed(1)}% average across all assignments`,
          confidence: 'high',
          actionable: false
        })
      }
    }

    // Analyze study session patterns (if available)
    if (sessions && sessions.length >= 3) {
      const sessionHours = sessions.map(s => new Date(s.started_at).getHours())
      const morningStudy = sessionHours.filter(h => h >= 6 && h <= 11).length
      const afternoonStudy = sessionHours.filter(h => h >= 12 && h <= 17).length
      const eveningStudy = sessionHours.filter(h => h >= 18 && h <= 22).length

      if (morningStudy > sessions.length * 0.5) {
        patterns.push({
          type: 'time',
          icon: Clock,
          title: 'Early Bird Learner',
          description: 'You prefer morning study sessions for better focus',
          confidence: 'medium',
          actionable: true,
          suggestion: 'Schedule challenging subjects in the morning when you\'re most alert'
        })
      } else if (eveningStudy > sessions.length * 0.5) {
        patterns.push({
          type: 'time',
          icon: Clock,
          title: 'Evening Study Preference',
          description: 'You typically study better in the evening hours',
          confidence: 'medium',
          actionable: true,
          suggestion: 'Block out consistent evening time for focused study'
        })
      }
    }

    // Add motivational insights if patterns are sparse
    if (patterns.length < 2) {
      patterns.push({
        type: 'habit',
        icon: Lightbulb,
        title: 'Building Study Consistency',
        description: 'Complete more assignments to unlock detailed behavioral patterns',
        confidence: 'low',
        actionable: true,
        suggestion: 'Maintain regular study habits to generate more insights'
      })
    }

    return patterns.slice(0, 4) // Limit to 4 patterns
  }

  const patterns = analyzePatterns()

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'time': return 'bg-blue-50 border-blue-200'
      case 'day': return 'bg-purple-50 border-purple-200'
      case 'course': return 'bg-green-50 border-green-200'
      case 'performance': return 'bg-yellow-50 border-yellow-200'
      case 'habit': return 'bg-sage-50 border-sage-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-warm-gray-800 flex items-center">
            <Brain className="h-5 w-5 text-sage-600 mr-2" />
            Smart Pattern Insights
          </h2>
          <p className="text-sm text-warm-gray-600 mt-1">
            AI-powered analysis of your study behaviors
          </p>
        </div>
        <div className="text-xs text-warm-gray-500 text-right">
          <div>{patterns.length} pattern{patterns.length !== 1 ? 's' : ''} detected</div>
          <div>Updated automatically</div>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="space-y-4">
        {patterns.map((pattern, index) => {
          const Icon = pattern.icon
          return (
            <div 
              key={index}
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${getPatternColor(pattern.type)}`}
              onClick={() => setSelectedPattern(selectedPattern?.title === pattern.title ? null : pattern)}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon className="h-5 w-5 text-warm-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-warm-gray-800">
                      {pattern.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(pattern.confidence)}`}>
                      {pattern.confidence} confidence
                    </span>
                  </div>
                  
                  <p className="text-sm text-warm-gray-600 mb-2">
                    {pattern.description}
                  </p>
                  
                  {pattern.suggestion && selectedPattern?.title === pattern.title && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-warm-gray-200">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-warm-gray-800 mb-1">
                            💡 Suggestion
                          </p>
                          <p className="text-sm text-warm-gray-600">
                            {pattern.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Insights Summary */}
      <div className="mt-6 pt-6 border-t border-warm-gray-100">
        <div className="bg-gradient-to-r from-lavender-50 to-sage-50 rounded-xl p-4">
          <h4 className="font-medium text-warm-gray-800 mb-2">
            🎯 Weekly Focus
          </h4>
          <p className="text-sm text-warm-gray-600">
            {(() => {
              const actionablePatterns = patterns.filter(p => p.actionable && p.suggestion)
              if (actionablePatterns.length > 0) {
                return `Focus on: ${actionablePatterns[0].suggestion}`
              }
              return "Keep building consistent study habits to unlock more personalized insights"
            })()}
          </p>
        </div>
      </div>
    </div>
  )
}
