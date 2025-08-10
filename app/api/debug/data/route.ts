import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get courses from cache
    const { data: coursesData } = await supabase
      .from('canvas_courses_cache')
      .select('canvas_course_id, name, course_code')
      .eq('user_id', user.id)
    
    // Get sample assignments with course IDs
    const { data: assignmentsData } = await supabase
      .from('canvas_assignments_cache')
      .select('canvas_assignment_id, name, course_id, score')
      .eq('user_id', user.id)
      .not('score', 'is', null)
      .limit(5)
    
    return NextResponse.json({
      courses: coursesData || [],
      sampleAssignments: assignmentsData || [],
      debug: {
        userID: user.id,
        coursesCount: coursesData?.length || 0,
        assignmentsCount: assignmentsData?.length || 0
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to debug data',
      details: error.message 
    }, { status: 500 })
  }
}
