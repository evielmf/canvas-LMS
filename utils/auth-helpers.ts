/**
 * Utility functions for handling authentication errors
 */

export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    // Clear all Supabase-related storage
    const keysToRemove = []
    
    // Find all keys that contain 'supabase' or 'sb-'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        keysToRemove.push(key)
      }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Also clear session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        sessionStorage.removeItem(key)
      }
    }
  }
}

export const isAuthError = (error: any): boolean => {
  return error?.message?.includes('refresh_token_not_found') || 
         error?.message?.includes('Invalid Refresh Token') ||
         error?.code === 'refresh_token_not_found'
}
