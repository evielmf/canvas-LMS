import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function GET(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.log('Fetching Canvas assignments from cache...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get assignments from cache
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)
      .order('due_at', { ascending: true, nullsFirst: false })

    if (assignmentsError) {
      console.error('Error fetching assignments from cache:', assignmentsError)
      return NextResponse.json({ error: 'Failed to fetch assignments from cache' }, { status: 500 })
    }

    // Get courses from cache for enrichment
    const { data: coursesData } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)

    const coursesMap = new Map(coursesData?.map(course => [course.canvas_course_id, course]) || [])

    // Transform cache data to match frontend expectations
    const assignments = assignmentsData?.map(assignment => ({
      id: assignment.canvas_assignment_id.toString(),
      name: assignment.name,
      description: assignment.description,
      due_at: assignment.due_at,
      points_possible: assignment.points_possible,
      course_id: assignment.course_id.toString(),
      submission_types: assignment.submission_types,
      html_url: assignment.html_url,
      course: coursesMap.get(assignment.course_id) ? {
        id: assignment.course_id.toString(),
        name: coursesMap.get(assignment.course_id)?.name,
        course_code: coursesMap.get(assignment.course_id)?.course_code
      } : null,
      submission: assignment.has_submission ? {
        id: `${assignment.canvas_assignment_id}_submission`,
        score: assignment.score,
        submitted_at: assignment.submitted_at,
        workflow_state: assignment.workflow_state
      } : null,
      has_submission: assignment.has_submission,
      workflow_state: assignment.workflow_state,
      assignment_group_id: assignment.assignment_group_id,
      created_at_canvas: assignment.created_at_canvas,
      updated_at_canvas: assignment.updated_at_canvas
    })) || []

    console.log(`Successfully fetched ${assignments.length} assignments from cache`)

    // Check if cache is empty and suggest sync
    if (assignments.length === 0) {
      const jsonResponse = NextResponse.json({ 
        assignments: [],
        count: 0,
        needsSync: true,
        message: 'No assignments found in cache. Please sync Canvas data.'
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
      assignments,
      count: assignments.length,
      fromCache: true
    }, { status: 200 })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error: any) {
    console.error('Assignments API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch assignments',
      details: error.message 
    }, { status: 500 })
  }
}
