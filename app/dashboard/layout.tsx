import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileBottomNav from '@/components/dashboard/MobileBottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      <DashboardNav user={session.user} />
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  )
}
