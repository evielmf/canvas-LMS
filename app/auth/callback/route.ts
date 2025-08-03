import { createClient } from '@/utils/supabase/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const { supabase, response } = createClient(request)
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`)
      }

      // Verify session was created
      if (data.session) {
        console.log('Session created successfully for user:', data.user?.email)
        
        // Create the redirect response
        const redirectResponse = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
        
        // Copy any cookies from the supabase response to ensure session is preserved
        const cookies = response.headers.getSetCookie()
        cookies.forEach(cookie => {
          redirectResponse.headers.append('Set-Cookie', cookie)
        })
        
        return redirectResponse
      } else {
        console.error('No session created after code exchange')
        return NextResponse.redirect(`${requestUrl.origin}/?error=no_session`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`)
    }
  }

  // No code provided - redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
