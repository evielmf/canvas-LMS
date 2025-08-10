import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function GET(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.log('Fetching Canvas courses from cache...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get courses from cache
    const { data: coursesData, error: coursesError } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (coursesError) {
      console.error('Error fetching courses from cache:', coursesError)
      return NextResponse.json({ error: 'Failed to fetch courses from cache' }, { status: 500 })
    }

    // Transform cache data to match frontend expectations
    const courses = coursesData?.map(course => ({
      id: course.canvas_course_id.toString(),
      name: course.name,
      course_code: course.course_code,
      start_at: course.start_at,
      end_at: course.end_at,
      workflow_state: course.workflow_state,
      enrollment_term_id: course.enrollment_term_id,
      course_color: course.course_color
    })) || []

    console.log(`Successfully fetched ${courses.length} courses from cache`)

    // Check if cache is empty and suggest sync
    if (courses.length === 0) {
      const jsonResponse = NextResponse.json({ 
        courses: [],
        count: 0,
        needsSync: true,
        message: 'No courses found in cache. Please sync Canvas data.'
      }, { status: 200 })
      
      // Copy cookies from supabase response
      const cookies = response.headers.getSetCookie()
      cookies.forEach(cookie => {
        jsonResponse.headers.append('Set-Cookie', cookie)
      })
      
      return jsonResponse
    }

    // Return response with cookies preserved
    const jsonResponse = NextResponse.json({ 
      courses,
      count: courses.length,
      fromCache: true
    }, { status: 200 })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error: any) {
    console.error('Courses API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch courses',
      details: error.message 
    }, { status: 500 })
  }
}
