'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { BookOpen, Calendar, GraduationCap, BarChart3, Users, Clock, CheckCircle, Star, ArrowRight, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    <div className="min-h-screen bg-black">
      {/* Navigation Header with matte black styling and mobile menu */}
      <header className="relative z-[999] flex min-h-16 w-full items-center border-b border-gray-800 bg-black px-[5%] md:min-h-18">
        <div className="mx-auto flex size-full max-w-full items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Easeboard</h1>
              <p className="text-xs text-gray-400 font-medium">Canvas LMS Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <nav className="flex space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Benefits</a>
              <a href="#support" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Support</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading || !supabaseConnected}
                className="inline-flex items-center justify-center gap-3 rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-gray-900/50 text-white px-5 py-2 hover:bg-gray-800/50 backdrop-blur-sm"
              >
                Sign In
              </button>
              <button
                onClick={handleGoogleLogin}
                disabled={loading || !supabaseConnected}
                className="inline-flex items-center justify-center gap-3 rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white text-black px-5 py-2 hover:bg-gray-100"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                ) : null}
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-gray-800 lg:hidden">
            <div className="px-[5%] py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">Features</a>
                <a href="#benefits" className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">Benefits</a>
                <a href="#support" className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">Support</a>
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading || !supabaseConnected}
                  className="inline-flex items-center justify-center gap-3 rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-gray-900/50 text-white px-5 py-2 hover:bg-gray-800/50 backdrop-blur-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading || !supabaseConnected}
                  className="inline-flex items-center justify-center gap-3 rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white text-black px-5 py-2 hover:bg-gray-100"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : null}
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with matte black background and floating elements */}
      <section id="hero" className="px-[5%] py-16 md:py-24 lg:py-28 bg-black relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl float-animation"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl float-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-500/5 rounded-full blur-2xl"></div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 gap-x-20 gap-y-12 md:gap-y-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 md:mb-6 text-white leading-tight tracking-tight">
                Transform Your Canvas Experience into Something <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">Beautiful</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed">
                Easeboard brings clarity and calm to your academic life. Connect your Canvas LMS and discover a dashboard designed to reduce stress while keeping you organized and focused on what matters most.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading || !supabaseConnected}
                  className="inline-flex items-center justify-center gap-3 rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 shadow-lg hover:scale-105 transform"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  {loading ? 'Connecting...' : 'Start with Google'}
                </button>
              </div>
              
              {/* Connection status */}
              {!supabaseConnected && (
                <div className="mt-4 text-sm text-gray-400 bg-gray-900/50 border border-gray-800 p-3 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
                    <span>Connecting to authentication service...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with matte black styling */}
      <section id="features" className="px-[5%] py-16 md:py-24 lg:py-28 bg-gray-900/30 backdrop-blur-sm">
        <div className="container">
          <div className="mb-12 text-center md:mb-18 lg:mb-20">
            <div className="mx-auto w-full max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything you need for academic success
              </h2>
              <p className="text-lg text-gray-300">
                Designed specifically for students who want to excel without the stress
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            <div className="flex flex-col items-center text-center group">
              <div className="mb-5 md:mb-6">
                <div className="size-16 flex items-center justify-center bg-gray-800/50 rounded-2xl border border-gray-700 group-hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm glow-blue group-hover:scale-110 transform">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-5 md:mb-6 text-white">
                Smart Assignment Tracking
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Never miss another deadline. Get intelligent reminders and priority sorting based on due dates and importance.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <button className="inline-flex items-center justify-center rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 text-blue-400 hover:text-blue-300 p-0">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="mb-5 md:mb-6">
                <div className="size-16 flex items-center justify-center bg-gray-800/50 rounded-2xl border border-gray-700 group-hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm glow-purple group-hover:scale-110 transform">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-5 md:mb-6 text-white">
                Grade Analytics & Insights
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Visualize your academic progress with beautiful charts and get actionable insights to improve your performance.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <button className="inline-flex items-center justify-center rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 text-purple-400 hover:text-purple-300 p-0">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="mb-5 md:mb-6">
                <div className="size-16 flex items-center justify-center bg-gray-800/50 rounded-2xl border border-gray-700 group-hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm glow-green group-hover:scale-110 transform">
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-5 md:mb-6 text-white">
                Mindful Schedule Planning
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Balance your academic and personal life with intelligent scheduling that respects your well-being.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <button className="inline-flex items-center justify-center rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 text-green-400 hover:text-green-300 p-0">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section with matte black styling */}
      <section id="benefits" className="px-[5%] py-16 md:py-24 lg:py-28 bg-black">
        <div className="container">
          <div className="grid grid-cols-1 gap-y-12 md:grid-flow-row md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
            <div>
              <h2 className="text-3xl md:text-4xl mb-5 font-bold md:mb-6 text-white">
                Built for students, by students who understand the struggle
              </h2>
              <p className="text-lg mb-6 md:mb-8 text-gray-300 leading-relaxed">
                We know Canvas can be overwhelming. That's why we created Easeboard - to give you clarity, reduce stress, and help you focus on learning instead of managing chaos.
              </p>
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2">
                <div className="flex items-start space-x-3 group">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <div>
                    <h4 className="font-semibold text-white">Stress-Free Organization</h4>
                    <p className="text-sm text-gray-400">Clean, intuitive interface designed to calm rather than overwhelm</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 group">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <div>
                    <h4 className="font-semibold text-white">Smart Notifications</h4>
                    <p className="text-sm text-gray-400">Get reminded at the right time, not constantly bombarded</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 group">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <div>
                    <h4 className="font-semibold text-white">Privacy First</h4>
                    <p className="text-sm text-gray-400">Your data stays secure and private - we never share or sell it</p>
                  </div>
                </div>

              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/30 hover:bg-gray-800/70 transition-all duration-200 group">
                    <Star className="w-5 h-5 text-yellow-400 group-hover:scale-125 transition-transform duration-200" />
                    <span className="text-white font-medium">"Finally, Canvas makes sense!"</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/30 hover:bg-gray-800/70 transition-all duration-200 group">
                    <Users className="w-5 h-5 text-blue-400 group-hover:scale-125 transition-transform duration-200" />
                    <span className="text-white font-medium">Join 2,500+ happy students</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500/30 hover:bg-gray-800/70 transition-all duration-200 group">
                    <Clock className="w-5 h-5 text-green-400 group-hover:scale-125 transition-transform duration-200" />
                    <span className="text-white font-medium">Save 5+ hours per week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with matte black styling */}
      <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-gray-900/30 backdrop-blur-sm border-t border-gray-800">
        <div className="container grid grid-cols-1 items-start justify-between gap-6 md:gap-x-12 md:gap-y-8 lg:grid-cols-[1fr_max-content] lg:gap-x-20">
          <div className="w-full max-w-lg">
            <h2 className="text-3xl md:text-4xl mb-3 font-bold md:mb-4 text-white">
              Ready to transform your Canvas experience?
            </h2>
            <p className="text-lg text-gray-300">
              Join thousands of students who have already discovered a better way to manage their academic life.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || !supabaseConnected}
              className="inline-flex items-center justify-center gap-3 rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              {loading ? 'Getting Started...' : 'Get Started Now'}
            </button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="px-[5%] py-16 md:py-24 lg:py-28 bg-black">
        <div className="container">
          <div className="mb-12 text-center md:mb-18 lg:mb-20">
            <div className="mx-auto w-full max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Need Help? We're Here for You
              </h2>
              <p className="text-lg text-gray-300">
                Get the support you need to make the most of Easeboard
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            <div className="flex flex-col items-center text-center group">
              <div className="mb-5 md:mb-6">
                <div className="size-16 flex items-center justify-center bg-gray-800/50 rounded-2xl border border-gray-700 group-hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm glow-blue group-hover:scale-110 transform">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-5 md:mb-6 text-white">
                Getting Started Guide
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Step-by-step instructions to connect your Canvas account and set up your dashboard for the first time.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <button className="inline-flex items-center justify-center rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 text-blue-400 hover:text-blue-300 p-0">
                  View Guide
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="mb-5 md:mb-6">
                <div className="size-16 flex items-center justify-center bg-gray-800/50 rounded-2xl border border-gray-700 group-hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm glow-green group-hover:scale-110 transform">
                  <BookOpen className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-5 md:mb-6 text-white">
                Documentation & FAQs
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Find answers to common questions about features, troubleshooting, and making the most of your dashboard.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <button className="inline-flex items-center justify-center rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 text-green-400 hover:text-green-300 p-0">
                  Browse FAQs
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="mb-5 md:mb-6">
                <div className="size-16 flex items-center justify-center bg-gray-800/50 rounded-2xl border border-gray-700 group-hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm glow-purple group-hover:scale-110 transform">
                  <GraduationCap className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-5 md:mb-6 text-white">
                Contact Support
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Have a specific question or issue? Reach out to our support team and we'll help you get back on track.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <a href="mailto:support@easeboard.app" className="inline-flex items-center justify-center rounded-xl whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 text-purple-400 hover:text-purple-300 p-0">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-16 text-center">
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 backdrop-blur-sm max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
              <p className="text-gray-300 mb-6">
                For technical support, feature requests, or general inquiries, we're here to help.
              </p>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-medium">Support Email:</span>
                  <a href="mailto:support@easeboard.app" className="text-blue-400 hover:text-blue-300 transition-colors">
                    support@easeboard.app
                  </a>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-medium">Response Time:</span>
                  <span>Usually within 24 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-medium">Hours:</span>
                  <span>Monday - Friday, 9 AM - 6 PM EST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with matte black styling */}
      <footer className="px-[5%] py-12 md:py-18 lg:py-20 border-t border-gray-800 bg-black">
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h3 className="text-lg font-bold text-white">Easeboard</h3>
            </div>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Making Canvas LMS beautiful, organized, and stress-free for students everywhere. 
              Built with ❤️ for the academic community.
            </p>
            <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
