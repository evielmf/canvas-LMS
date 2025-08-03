import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function GET(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.log('Fetching Canvas grades from cache and live data...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cached assignments that have submissions (grades)
    let assignmentsData, assignmentsError
    
    try {
      const result = await supabase
        .from('canvas_assignments_cache')
        .select('*')
        .eq('user_id', user.id)
        .not('score', 'is', null)
        .order('submitted_at', { ascending: false })
      
      assignmentsData = result.data
      assignmentsError = result.error
    } catch (error) {
      console.warn('Primary query failed, trying fallback:', error)
      assignmentsError = error as any
    }

    if (assignmentsError) {
      console.error('Error fetching graded assignments from cache:', assignmentsError)
      
      // If the column doesn't exist, try with basic query
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('canvas_assignments_cache')
          .select('*')
          .eq('user_id', user.id)
          .order('synced_at', { ascending: false })

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError)
          return NextResponse.json({ 
            grades: [],
            message: 'No grades available - try syncing your Canvas data',
            needsSync: true
          })
        }
        
        assignmentsData = fallbackData
      } catch (fallbackError) {
        console.error('All queries failed:', fallbackError)
        return NextResponse.json({ 
          grades: [],
          message: 'No grades available - try syncing your Canvas data',
          needsSync: true
        })
      }
    }

    // Transform cached assignment data to grades format
    const grades = assignmentsData?.map(assignment => ({
      id: `${assignment.canvas_assignment_id}_grade`,
      score: assignment.score,
      points_possible: assignment.points_possible,
      assignment_name: assignment.name,
      course_id: assignment.course_id,
      graded_at: assignment.submitted_at || assignment.synced_at,
      assignment_id: assignment.canvas_assignment_id,
      percentage: assignment.points_possible > 0 
        ? Math.round((assignment.score / assignment.points_possible) * 100) 
        : 0
    })) || []

    console.log(`Successfully fetched ${grades.length} grades from cache`)

    // Check if cache is empty and suggest sync
    if (grades.length === 0) {
      const jsonResponse = NextResponse.json({ 
        grades: [],
        count: 0,
        needsSync: true,
        message: 'No grades found in cache. Please sync Canvas data.'
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
      grades,
      count: grades.length,
      fromCache: true
    }, { status: 200 })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error: any) {
    console.error('Grades API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch grades',
      details: error.message 
    }, { status: 500 })
  }
}
