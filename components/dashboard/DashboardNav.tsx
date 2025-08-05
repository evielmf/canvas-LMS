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
        <div className="flex justify-between h-16 lg:h-18">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2 lg:space-x-3">
              <div className="p-1.5 lg:p-2 bg-sage-100 rounded-lg lg:rounded-xl">
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-sage-600" />
              </div>
              <div>
                <span className="text-lg lg:text-xl font-heading font-semibold text-warm-gray-800 tracking-tight">
                  Easeboard
                </span>
                <p className="text-xs text-warm-gray-500 font-medium hidden sm:block">Your peaceful study space</p>
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

          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Gentle notifications - Hide on mobile for cleaner look */}
            <button 
              className="hidden sm:flex p-2 rounded-xl text-warm-gray-400 hover:text-warm-gray-600 hover:bg-cream-100 transition-all duration-200"
              aria-label="View notifications"
              title="View notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu with soft styling - Optimized for mobile */}
            <div className="flex items-center space-x-2 lg:space-x-3 pl-2 lg:pl-3 border-l border-warm-gray-200">
              <img
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg lg:rounded-xl object-cover shadow-gentle"
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

            {/* Mobile menu button - Hidden since we use bottom nav */}
            <div className="lg:hidden hidden">
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

    </nav>
  )
}
