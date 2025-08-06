'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { useSupabase } from '@/app/providers'
import { useUniversalPrefetch } from '@/hooks/useUniversalPrefetch'
import { 
  Home, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  TrendingUp,
  Bell,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SidebarProps {
  user: User
}

export default function Sidebar({ user }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const { supabase } = useSupabase()
    const router = useRouter()
    const pathname = usePathname()
    const {
      prefetchAssignments,
      prefetchGrades,
      prefetchSchedule,
      prefetchAnalytics,
      prefetchDashboard
    } = useUniversalPrefetch()

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true)
            }
        }
        
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
        { 
          name: 'Home', 
          href: '/dashboard', 
          icon: Home, 
          tooltip: 'Dashboard Overview',
          onPrefetch: prefetchDashboard
        },
        { 
          name: 'Assignments', 
          href: '/dashboard/assignments', 
          icon: BookOpen, 
          tooltip: 'View Assignments',
          onPrefetch: prefetchAssignments
        },
        { 
          name: 'Calendar', 
          href: '/dashboard/schedule', 
          icon: Calendar, 
          tooltip: 'Study Schedule',
          onPrefetch: prefetchSchedule
        },
        { 
          name: 'Grades', 
          href: '/dashboard/grades', 
          icon: BarChart3, 
          tooltip: 'Grade Progress',
          onPrefetch: prefetchGrades
        },
        { 
          name: 'Analytics', 
          href: '/dashboard/analytics', 
          icon: TrendingUp, 
          tooltip: 'Performance Analytics',
          onPrefetch: prefetchAnalytics
        },
        { 
          name: 'Settings', 
          href: '/dashboard/settings', 
          icon: Settings, 
          tooltip: 'Account Settings',
          onPrefetch: () => {} // No prefetch needed for settings
        },
    ]

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setCollapsed(true)}
                    />
                )}
            </AnimatePresence>
            
            <motion.div 
                animate={{ 
                    width: collapsed ? 80 : 256,
                    x: collapsed && (typeof window !== 'undefined' && window.innerWidth < 1024) ? -256 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md border-r border-warm-gray-100 z-40 shadow-soft flex flex-col"
            >
                {/* Logo and Brand */}
                <div className="p-4 border-b border-warm-gray-100">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                            <div className={`${collapsed ? 'p-3' : 'p-2'} bg-sage-100 rounded-xl`}>
                                <BookOpen className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} text-sage-600`} />
                            </div>
                            {!collapsed && (
                                <div className="transition-all duration-300">
                                    <span className="text-lg font-heading font-semibold text-warm-gray-800 tracking-tight">
                                        Easeboard
                                    </span>
                                    <p className="text-xs text-warm-gray-500 font-medium">Your peaceful study space</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Collapse Toggle - Hidden on mobile, always visible on desktop */}
                        {!collapsed && (
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden lg:block p-2 rounded-xl text-warm-gray-400 hover:text-warm-gray-600 hover:bg-sage-50 transition-all duration-200"
                                title="Collapse sidebar"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="p-4 border-b border-warm-gray-100">
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                        <img
                            className={`${collapsed ? 'h-12 w-12' : 'h-10 w-10'} rounded-xl object-cover shadow-gentle`}
                            src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6B8269&color=fff`}
                            alt={user.email || 'User'}
                        />
                        {!collapsed && (
                            <div className="transition-all duration-300 flex-1 min-w-0">
                                <div className="text-sm font-medium text-warm-gray-800 truncate">
                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </div>
                                <div className="text-xs text-warm-gray-500">Student</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications Section */}
                {!collapsed && (
                    <div className="p-4 border-b border-warm-gray-100">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-warm-gray-600 hover:text-warm-gray-800 hover:bg-sage-50 rounded-xl transition-all duration-200"
                        >
                            <div className="flex items-center space-x-3">
                                <Bell className="w-4 h-4 text-warm-gray-500" />
                                <span>Notifications</span>
                            </div>
                            <div className="w-2 h-2 bg-soft-blue-500 rounded-full"></div>
                        </button>
                        
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-3 bg-sage-25 rounded-lg text-xs text-warm-gray-600"
                            >
                                No new notifications
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            
                            return (
                                <div key={item.name} className="relative group">
                                    <a
                                        href={item.href}
                                        onMouseEnter={() => {
                                            // Prefetch on hover for instant loading
                                            item.onPrefetch()
                                        }}
                                        className={`flex items-center ${collapsed ? 'px-4 py-4' : 'px-3 py-2.5'} text-sm font-medium rounded-xl transition-all duration-200 ${
                                            active
                                                ? 'bg-sage-100 text-sage-700 shadow-gentle'
                                                : 'text-warm-gray-600 hover:text-warm-gray-800 hover:bg-sage-50'
                                        } ${collapsed ? 'justify-center' : 'space-x-3'}`}
                                        title={collapsed ? item.tooltip : ''}
                                        onClick={() => {
                                            // Close sidebar on mobile after navigation
                                            if (window.innerWidth < 1024) {
                                                setCollapsed(true)
                                            }
                                        }}
                                    >
                                        <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${active ? 'text-sage-600' : 'text-warm-gray-500'} group-hover:text-sage-600 transition-colors`} />
                                        {!collapsed && (
                                            <span className="transition-all duration-300">{item.name}</span>
                                        )}
                                        
                                        {active && !collapsed && (
                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-sage-600 rounded-l-full"></div>
                                        )}
                                    </a>
                                    
                                    {/* Tooltip for collapsed state */}
                                    {collapsed && (
                                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-2 py-1 bg-warm-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                            {item.tooltip}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-warm-gray-100">
                    <div className={`space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                        {/* Expand button for collapsed state */}
                        {collapsed && (
                            <button
                                onClick={() => setCollapsed(false)}
                                className="p-3 rounded-xl text-warm-gray-400 hover:text-warm-gray-600 hover:bg-sage-50 transition-all duration-200"
                                title="Expand sidebar"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                        
                        {/* Sign Out */}
                        <button
                            onClick={handleSignOut}
                            className={`flex items-center w-full ${collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5 space-x-3'} text-sm font-medium text-warm-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200`}
                            title={collapsed ? 'Sign out' : ''}
                        >
                            <LogOut className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} text-warm-gray-500`} />
                            {!collapsed && <span>Sign out</span>}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollapsed(!collapsed)}
                className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-soft border border-warm-gray-100 text-warm-gray-600 hover:text-warm-gray-800"
            >
                <Menu className="h-5 w-5" />
            </motion.button>
        </>
    )
}

