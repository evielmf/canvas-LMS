import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AuthPage from '@/components/auth/AuthPage'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <AuthPage />
}
