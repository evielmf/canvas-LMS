'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { BookOpen, Calendar, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { supabase } = useSupabase()

  useEffect(() => {
    setMounted(true)
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        setSupabaseConnected(true)
        console.log('Supabase connection successful')
      } catch (error) {
        console.error('Supabase connection failed:', error)
        toast.error('Unable to connect to authentication service')
      }
    }
    
    testConnection()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      console.log('Starting Google OAuth flow...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('Auth Error Details:', error)
        toast.error(`Authentication failed: ${error.message}`)
      } else {
        console.log('OAuth initiated successfully:', data)
        // The redirect will happen automatically, so we don't set loading to false here
        return
      }
    } catch (error: any) {
      console.error('Unexpected error during authentication:', error)
      toast.error(`Authentication failed: ${error.message || 'Unknown error'}`)
    } finally {
      // Only set loading to false if there was an error
      // If successful, user will be redirected
      setTimeout(() => setLoading(false), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <GraduationCap className="w-8 h-8 text-canvas-blue" />
            <h1 className="text-3xl font-bold text-gray-900">Canvas Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Your personalized Canvas LMS student dashboard
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Track Assignments</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Manage Schedule</p>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading || !supabaseConnected}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-canvas-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {loading ? 'Signing in...' : !supabaseConnected ? 'Connecting...' : 'Continue with Google'}
            </button>

            {!supabaseConnected && (
              <div className="text-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                Connecting to authentication service...
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to securely connect your Canvas LMS account
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
