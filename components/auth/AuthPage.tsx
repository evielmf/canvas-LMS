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
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Welcome section with calming design */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="p-3 bg-white rounded-2xl shadow-soft">
              <GraduationCap className="w-8 h-8 text-sage-600" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-semibold text-warm-gray-800 tracking-tight">
                Easeboard
              </h1>
              <p className="text-sm text-warm-gray-500 font-medium tracking-wide">
                Your peaceful study companion
              </p>
            </div>
          </div>
          <p className="text-lg text-warm-gray-600 leading-relaxed max-w-md mx-auto">
            Find calm in your studies with a dashboard designed to reduce stress and keep you focused
          </p>
        </div>

        {/* Main card with soft design */}
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-soft border border-white/50">
          <div className="space-y-8">
            {/* Benefits grid with natural tones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-sage rounded-2xl border border-sage-100 text-center group hover:shadow-gentle transition-all duration-300">
                <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-sage-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-sage-600" />
                </div>
                <p className="text-sm text-warm-gray-700 font-medium">Gentle Assignment Tracking</p>
                <p className="text-xs text-warm-gray-500 mt-1">Stay organized without the overwhelm</p>
              </div>
              <div className="p-5 bg-gradient-soft rounded-2xl border border-soft-blue-100 text-center group hover:shadow-gentle transition-all duration-300">
                <div className="w-12 h-12 bg-soft-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-soft-blue-200 transition-colors">
                  <Calendar className="w-6 h-6 text-soft-blue-600" />
                </div>
                <p className="text-sm text-warm-gray-700 font-medium">Mindful Schedule Planning</p>
                <p className="text-xs text-warm-gray-500 mt-1">Balance your time with ease</p>
              </div>
            </div>

            {/* Sign in button with calming design */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading || !supabaseConnected}
              className="w-full flex items-center justify-center px-6 py-4 bg-sage-500 hover:bg-sage-600 text-white font-medium rounded-2xl shadow-soft hover:shadow-soft-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              ) : (
                <svg className="w-5 h-5 mr-3 opacity-90 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
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
              <span className="text-base">
                {loading ? 'Creating your peaceful space...' : !supabaseConnected ? 'Connecting gently...' : 'Begin with Google'}
              </span>
            </button>

            {/* Connection status with soft styling */}
            {!supabaseConnected && (
              <div className="text-center text-sm text-lavender-600 bg-lavender-50 border border-lavender-200 p-4 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-lavender-300 rounded-full animate-soft-pulse"></div>
                  <span>Preparing your tranquil workspace...</span>
                </div>
              </div>
            )}

            {/* Privacy note with gentle styling */}
            <p className="text-xs text-warm-gray-400 text-center leading-relaxed">
              Your Canvas data stays private and secure. We're here to help you study with peace of mind.
            </p>
          </div>
        </div>

        {/* Additional calm messaging */}
        <div className="text-center mt-8">
          <p className="text-sm text-warm-gray-500">
            ✨ Designed for students who value clarity and calm in their academic journey
          </p>
        </div>
      </div>
    </div>
  )
}
