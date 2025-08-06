'use client'

import { clearAuthStorage } from '@/utils/auth-helpers'
import { useSupabase } from '@/app/providers'
import { useState } from 'react'

export default function AuthDebugPanel() {
  const { supabase } = useSupabase()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearAuth = async () => {
    setIsClearing(true)
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      // Clear local storage
      clearAuthStorage()
      // Reload the page to refresh everything
      window.location.href = '/'
    } catch (error) {
      console.error('Error clearing auth:', error)
    }
    setIsClearing(false)
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-sm font-medium text-red-800 mb-2">
        Authentication Issues?
      </h3>
      <p className="text-sm text-red-600 mb-3">
        If you're experiencing login problems, try clearing your authentication data.
      </p>
      <button
        onClick={handleClearAuth}
        disabled={isClearing}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isClearing ? 'Clearing...' : 'Clear Auth Data'}
      </button>
    </div>
  )
}
