'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/app/providers'

export function useCanvasToken() {
  const { user, supabase } = useSupabase()

  const { 
    data: hasToken, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['canvas-token', user?.id],
    queryFn: async () => {
      if (!user || !supabase) {
        return false
      }

      try {
        const { data, error } = await supabase
          .from('canvas_tokens')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking Canvas token:', error)
          return false
        }

        return !!data
      } catch (error) {
        console.error('Error in Canvas token check:', error)
        return false
      }
    },
    enabled: !!user && !!supabase,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })

  return {
    hasToken: hasToken || false,
    isLoading,
    error,
    refetch,
  }
}
