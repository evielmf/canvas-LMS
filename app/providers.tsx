'use client'

import { createClient } from '@/utils/supabase/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: SupabaseClient
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15 * 60 * 1000, // 15 minutes - longer to reduce API calls
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
        refetchOnWindowFocus: false, // Don't refetch on focus
        refetchOnMount: 'always', // Always check cache first
        refetchOnReconnect: false,
        retry: 2, // Reasonable retry count
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      },
      mutations: {
        retry: 1,
      },
    },
  }))
  
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-fetch user data to ensure it's authentic
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider value={{ supabase, user }}>
        {children}
      </Context.Provider>
    </QueryClientProvider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a Providers component')
  }
  return context
}
