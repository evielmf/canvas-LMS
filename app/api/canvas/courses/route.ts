import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'
import CryptoJS from 'crypto-js'

const decryptToken = (encryptedToken: string) => {
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'canvas-dashboard-key'
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Error decrypting token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Canvas token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError) {
      console.error('Canvas token error:', tokenError)
      if (tokenError.code === 'PGRST116') {
        return NextResponse.json({ error: 'No Canvas token found. Please set up Canvas in Settings.' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Database error: ' + tokenError.message }, { status: 500 })
    }

    if (!tokenData) {
      return NextResponse.json({ error: 'No Canvas token found' }, { status: 404 })
    }

    const token = decryptToken(tokenData.encrypted_token)
    if (!token) {
      return NextResponse.json({ error: 'Failed to decrypt token' }, { status: 400 })
    }

    console.log(`Fetching courses from: ${tokenData.canvas_url}`)

    // Fetch courses from Canvas
    const coursesResponse = await fetch(`${tokenData.canvas_url}/api/v1/courses?enrollment_state=active&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!coursesResponse.ok) {
      console.error('Canvas API error:', coursesResponse.status, coursesResponse.statusText)
      const errorText = await coursesResponse.text()
      return NextResponse.json({ 
        error: 'Canvas API error', 
        details: `HTTP ${coursesResponse.status}: ${errorText}` 
      }, { status: coursesResponse.status })
    }

    const courses = await coursesResponse.json()
    console.log(`Successfully fetched ${courses.length} courses`)

    // Cache courses in database
    for (const course of courses) {
      try {
        await supabase
          .from('canvas_courses_cache')
          .upsert({
            user_id: user.id,
            canvas_course_id: course.id,
            name: course.name,
            course_code: course.course_code,
            enrollment_term_id: course.enrollment_term_id,
            synced_at: new Date().toISOString(),
          })
      } catch (cacheError) {
        console.error('Error caching course:', cacheError)
        // Continue with other courses even if one fails
      }
    }

    // Return response with cookies preserved
    const jsonResponse = NextResponse.json({ courses })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error) {
    console.error('Error fetching Canvas courses:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
