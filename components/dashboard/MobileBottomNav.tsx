'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Settings,
  User as UserIcon
} from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Assignments', href: '/dashboard/assignments', icon: BookOpen },
    { name: 'Grades', href: '/dashboard/grades', icon: BarChart3 },
    { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sage-200 px-2 py-1 lg:hidden">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-sage-600 bg-sage-50'
                    : 'text-warm-gray-500 hover:text-warm-gray-700 hover:bg-sage-25'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-sage-600' : 'text-warm-gray-500'}`} />
                <span className={`text-xs font-medium truncate ${
                  isActive ? 'text-sage-600' : 'text-warm-gray-500'
                }`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Bottom padding to prevent content overlap */}
      <div className="h-20 lg:hidden" />
    </>
  )
}
