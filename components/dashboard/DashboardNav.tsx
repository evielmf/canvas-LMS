'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  User as UserIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardNavProps {
  user: User
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Assignments', href: '/dashboard/assignments', icon: BookOpen },
    { name: 'Grades', href: '/dashboard/grades', icon: BarChart3 },
    { name: 'Professor', href: '/dashboard/professor', icon: UserIcon },
    { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-soft border-b border-warm-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="p-2 bg-sage-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-sage-600" />
              </div>
              <div>
                <span className="text-xl font-heading font-semibold text-warm-gray-800 tracking-tight">
                  Easeboard
                </span>
                <p className="text-xs text-warm-gray-500 font-medium">Your peaceful study space</p>
              </div>
            </div>
            
            {/* Desktop Navigation with calm styling */}
            <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-warm-gray-600 hover:text-warm-gray-800 hover:bg-sage-50 rounded-xl transition-all duration-200 group"
                  >
                    <Icon className="w-4 h-4 mr-2 text-warm-gray-500 group-hover:text-sage-600 transition-colors" />
                    {item.name}
                  </a>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Gentle notifications */}
            <button 
              className="p-2 rounded-xl text-warm-gray-400 hover:text-warm-gray-600 hover:bg-cream-100 transition-all duration-200"
              aria-label="View notifications"
              title="View notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu with soft styling */}
            <div className="flex items-center space-x-3 pl-3 border-l border-warm-gray-200">
              <img
                className="h-9 w-9 rounded-xl object-cover shadow-gentle"
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6B8269&color=fff`}
                alt={user.email || 'User'}
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-warm-gray-800">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-warm-gray-500">Student</div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-warm-gray-400 hover:text-warm-gray-600 hover:bg-cream-100 rounded-xl transition-all duration-200"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-warm-gray-400 hover:text-warm-gray-600 hover:bg-cream-100 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="block h-5 w-5" />
                ) : (
                  <Menu className="block h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu with gentle styling */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-warm-gray-100">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="block pl-3 pr-4 py-3 text-base font-medium text-warm-gray-600 hover:text-warm-gray-800 hover:bg-sage-50 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 text-warm-gray-500" />
                    {item.name}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
