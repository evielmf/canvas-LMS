'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { Eye, EyeOff, ExternalLink, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface CanvasTokenSetupProps {
  onComplete: () => void
}

export default function CanvasTokenSetup({ onComplete }: CanvasTokenSetupProps) {
  const [canvasUrl, setCanvasUrl] = useState('')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, supabase } = useSupabase()

  const testCanvasConnection = async (url: string, token: string) => {
    try {
      console.log('🧪 Testing Canvas connection from Setup...')
      
      const response = await fetch('/api/canvas/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvasUrl: url,
          canvasToken: token,
        }),
      }).catch(error => {
        console.error('❌ Network error testing Canvas connection:', error)
        throw new Error(`Network error: ${error.message}`)
      })

      const data = await response.json()
      
      console.log('📊 Canvas test response:', { status: response.status, data })
      
      if (!response.ok) {
        console.error('❌ Canvas connection test failed:', data)
        
        // Show detailed error message based on response
        let errorMessage = 'Invalid Canvas URL or token. Please check your credentials.'
        
        if (data.details) {
          errorMessage = data.details
        } else if (data.error) {
          errorMessage = data.error
        }
        
        // Add helpful hints for common errors
        if (response.status === 401) {
          errorMessage += '\n\nHint: Make sure your API token is valid and has not expired.'
        } else if (response.status === 404) {
          errorMessage += '\n\nHint: Check that your Canvas URL is correct (e.g., https://yourschool.instructure.com)'
        }
        
        toast.error(errorMessage, { duration: 8000 })
        return false
      }

      console.log('✅ Canvas connection successful:', data)
      
      // Show success message with user info
      if (data.user?.name) {
        toast.success(`Connected successfully as ${data.user.name}`, { duration: 5000 })
      } else {
        toast.success('Canvas connection test successful!', { duration: 5000 })
      }
      
      return true
    } catch (error) {
      console.error('🚨 Error testing Canvas connection:', error)
      
      let errorMessage = 'Network error occurred'
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(`Connection test failed: ${errorMessage}`, { duration: 8000 })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Debug logging
    console.log('🔍 Form submission debug:', {
      canvasUrl: canvasUrl ? 'filled' : 'empty',
      token: token ? 'filled' : 'empty',
      user: user ? 'exists' : 'null/undefined',
      userEmail: user?.email || 'no email'
    })
    
    if (!canvasUrl || !token) {
      toast.error('Please fill in both Canvas URL and API token')
      return
    }
    
    if (!user) {
      toast.error('Authentication error. Please refresh the page and try again.')
      console.error('User is null/undefined during Canvas setup')
      return
    }

    setLoading(true)
    
    try {
      // Normalize Canvas URL
      const normalizedUrl = canvasUrl.replace(/\/+$/, '')
      
      console.log('🔄 Starting Canvas setup process...')
      console.log('📍 Canvas URL:', normalizedUrl)
      console.log('🔑 Token length:', token.length)
      console.log('👤 User ID:', user.id)
      
      // Test connection and save via API (which handles encryption and storage)
      const testToastId = toast.loading('Testing Canvas connection and saving...', { 
        duration: 0,
        icon: '🧪'
      })
      
      const response = await fetch('/api/canvas/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvasUrl: normalizedUrl,
          canvasToken: token,
        }),
      }).catch(error => {
        toast.dismiss(testToastId)
        console.error('❌ Network error during Canvas setup:', error)
        throw new Error(`Network error: ${error.message}`)
      })

      const data = await response.json()
      toast.dismiss(testToastId)

      if (!response.ok) {
        console.error('❌ Canvas setup failed:', data)
        
        let errorMessage = 'Setup failed. Please check your credentials.'
        if (data.details) {
          errorMessage = data.details
        } else if (data.error) {
          errorMessage = data.error
        }
        
        // Add helpful hints for common errors
        if (response.status === 401) {
          errorMessage += '\n\nHint: Make sure your API token is valid and has not expired.'
        } else if (response.status === 404) {
          errorMessage += '\n\nHint: Check that your Canvas URL is correct (e.g., https://yourschool.instructure.com)'
        }
        
        toast.error(errorMessage, { duration: 8000 })
        return
      }

      console.log('✅ Canvas setup successful:', data)

      // Success feedback
      toast.success('🎉 Canvas token saved successfully!', { duration: 6000 })
      
      // Try to fetch and cache courses immediately
      try {
        const coursesResponse = await fetch('/api/canvas/courses').catch(error => {
          console.error('❌ Network error fetching courses after setup:', error)
          throw error
        })
        if (coursesResponse.ok) {
          console.log('✅ Successfully fetched courses after token setup')
          toast.success('📚 Course data synced successfully!', { duration: 3000 })
        } else {
          console.log('⚠️ Could not fetch courses: HTTP', coursesResponse.status)
        }
      } catch (courseError) {
        console.log('⚠️ Could not fetch courses immediately, but token was saved:', courseError)
      }

      // Show integration active message
      setTimeout(() => {
        toast.success('🔄 Canvas integration is now active!', { 
          duration: 5000,
          icon: '✅'
        })
      }, 1500)

      onComplete()
    } catch (error) {
      console.error('🚨 Error during Canvas setup:', error)
      
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as any).message)
      }
      
      toast.error(`Setup failed: ${errorMessage}`, { 
        duration: 10000,
        icon: '❌'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connect Your Canvas Account
        </h2>
        <p className="text-gray-600">
          Enter your Canvas instance URL and API token to sync your data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Canvas URL */}
        <div>
          <label htmlFor="canvas-url" className="block text-sm font-medium text-gray-700 mb-2">
            Canvas URL
          </label>
          <input
            id="canvas-url"
            type="url"
            value={canvasUrl}
            onChange={(e) => setCanvasUrl(e.target.value)}
            placeholder="https://yourschool.instructure.com"
            pattern="https://.*\.instructure\.com/?.*"
            title="Please enter a valid Canvas URL (e.g., https://yourschool.instructure.com)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent text-gray-900 placeholder-gray-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your institution's Canvas URL (without /login or other paths)
          </p>
        </div>

        {/* Canvas Token */}
        <div>
          <label htmlFor="canvas-token" className="block text-sm font-medium text-gray-700 mb-2">
            Canvas API Token
          </label>
          <div className="relative">
            <input
              id="canvas-token"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Canvas API token"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent text-gray-900 placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showToken ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to get your Canvas API token:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Log in to your Canvas account</li>
            <li>Go to Account → Settings</li>
            <li>Scroll down to "Approved Integrations"</li>
            <li>Click "New Access Token"</li>
            <li>Enter a purpose (e.g., "Student Dashboard")</li>
            <li>Copy the generated token and paste it above</li>
          </ol>
          <a
            href="https://community.canvaslms.com/t5/Admin-Guide/How-do-I-manage-API-access-tokens-as-an-admin/ta-p/89"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View detailed instructions
          </a>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Security Notice</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your Canvas token is encrypted and stored securely. We only use it to fetch your 
                course data and never share it with third parties.
              </p>
              {!user && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                  ⚠️ Authentication issue detected. User not loaded properly.
                </div>
              )}
              {user && (
                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-800">
                  ✅ Authenticated as: {user.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !canvasUrl || !token}
            className="flex-1 bg-canvas-blue text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-canvas-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Testing connection...
              </div>
            ) : (
              'Save Canvas Token'
            )}
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
