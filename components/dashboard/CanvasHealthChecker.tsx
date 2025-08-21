'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Wifi,
  WifiOff,
  Clock,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from 'react-hot-toast'

interface ValidationResult {
  valid: boolean
  error?: string
  details?: string
  needsReauth?: boolean
  needsSetup?: boolean
  canRetry?: boolean
  user?: {
    id: string
    name: string
    email: string
  }
  canvas_url?: string
  lastSync?: string
  message?: string
}

interface CanvasHealthCheckerProps {
  onTokenInvalid?: () => void
  onSyncNeeded?: () => void
  className?: string
}

export default function CanvasHealthChecker({ 
  onTokenInvalid, 
  onSyncNeeded, 
  className = "" 
}: CanvasHealthCheckerProps) {
  const { user } = useSupabase()
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-validate on mount and periodically
  useEffect(() => {
    if (user && isOnline) {
      validateToken()
      
      // Set up periodic validation (every 5 minutes)
      const interval = setInterval(() => {
        if (isOnline) {
          validateToken(true) // Silent validation
        }
      }, 5 * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [user, isOnline])

  const validateToken = async (silent = false) => {
    if (!user || !isOnline) return
    
    if (!silent) setIsValidating(true)
    
    try {
      const response = await fetch('/api/canvas/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result: ValidationResult = await response.json()
      setValidation(result)
      setLastChecked(new Date())
      
      if (!silent) {
        if (result.valid) {
          toast.success('Canvas connection verified! ✅')
        } else if (result.needsReauth) {
          toast.error('Canvas token expired - please re-authenticate')
          onTokenInvalid?.()
        } else if (result.needsSetup) {
          toast.error('Canvas not configured - please set up integration')
          onTokenInvalid?.()
        } else if (result.canRetry) {
          toast.error('Canvas connection issue - you can try again')
        }
      }
      
    } catch (error) {
      console.error('Validation error:', error)
      if (!silent) {
        toast.error('Unable to check Canvas connection')
      }
      setValidation({
        valid: false,
        error: 'Connection failed',
        details: 'Unable to verify Canvas token',
        canRetry: true
      })
      setLastChecked(new Date())
    } finally {
      if (!silent) setIsValidating(false)
    }
  }

  const handleRetry = () => {
    validateToken()
  }

  const handleSetupToken = () => {
    onTokenInvalid?.()
  }

  const handleSync = () => {
    onSyncNeeded?.()
  }

  // Don't render if offline
  if (!isOnline) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Offline</h3>
              <p className="text-xs text-orange-600">Canvas sync unavailable while offline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Don't render if no user
  if (!user) return null

  // Loading state
  if (isValidating && !validation) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Checking Canvas Connection</h3>
              <p className="text-xs text-blue-600">Validating your Canvas token...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state
  if (validation?.valid) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-green-800">Canvas Connected</h3>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    <Wifi className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  {validation.user && (
                    <p className="text-xs text-green-600">
                      Logged in as {validation.user.name}
                    </p>
                  )}
                  {lastChecked && (
                    <p className="text-xs text-green-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Verified {lastChecked.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isValidating}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                {isValidating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error states
  if (validation) {
    const isAuthError = validation.needsReauth || validation.needsSetup
    const borderColor = isAuthError ? 'border-red-200' : 'border-yellow-200'
    const bgColor = isAuthError ? 'bg-red-50' : 'bg-yellow-50'
    const iconColor = isAuthError ? 'text-red-600' : 'text-yellow-600'
    const textColor = isAuthError ? 'text-red-800' : 'text-yellow-800'
    const detailColor = isAuthError ? 'text-red-600' : 'text-yellow-600'

    return (
      <Card className={`${borderColor} ${bgColor} ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`h-5 w-5 ${iconColor} mt-0.5`} />
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${textColor}`}>
                  {validation.needsSetup ? 'Canvas Not Set Up' :
                   validation.needsReauth ? 'Canvas Token Expired' :
                   'Canvas Connection Issue'}
                </h3>
                <p className={`text-xs ${detailColor} mt-1`}>
                  {validation.details || validation.error}
                </p>
                {lastChecked && (
                  <p className={`text-xs ${detailColor} mt-1 flex items-center`}>
                    <Clock className="h-3 w-3 mr-1" />
                    Last checked {lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {validation.canRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isValidating}
                  className={`border-${isAuthError ? 'red' : 'yellow'}-300 ${textColor} hover:bg-${isAuthError ? 'red' : 'yellow'}-100`}
                >
                  {isValidating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </>
                  )}
                </Button>
              )}
              {(validation.needsReauth || validation.needsSetup) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetupToken}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Fix
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
