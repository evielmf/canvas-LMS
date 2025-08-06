import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileBottomNav from '@/components/dashboard/MobileBottomNav'
import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.log('Dashboard auth error:', error.message)
      // If there's an auth error, redirect to home
      redirect('/')
    }

    if (!user) {
      redirect('/')
    }

    return (
    <DashboardClientWrapper>
      <div className="min-h-screen bg-gradient-calm">
        {/* Desktop Sidebar Layout */}
        <div className="hidden lg:flex">
          <Sidebar user={user} />
          <main className="flex-1 ml-16 xl:ml-64">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <main className="pb-20 pt-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              {children}
            </div>
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </DashboardClientWrapper>
  )
  } catch (error) {
    console.error('Dashboard layout error:', error)
    redirect('/')
  }
}
