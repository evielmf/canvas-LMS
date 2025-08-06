import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function GET(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.time('PARALLEL_FETCH_ALL')
    console.log('🚀 Starting parallel fetch of all Canvas data...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // PARALLEL FETCH: Get all data types simultaneously
    const [assignmentsResult, coursesResult, gradesResult] = await Promise.all([
      // Assignments query
      supabase
        .from('canvas_assignments_cache')
        .select('*')
        .eq('user_id', user.id)
        .order('due_at', { ascending: true, nullsFirst: false }),
      
      // Courses query  
      supabase
        .from('canvas_courses_cache')
        .select('*')
        .eq('user_id', user.id),
      
      // Grades query
      supabase
        .from('canvas_grades_cache')
        .select('*')
        .eq('user_id', user.id)
        .order('graded_at', { ascending: false })
    ])

    // Check for errors in parallel results
    if (assignmentsResult.error) {
      console.error('Assignments fetch error:', assignmentsResult.error)
      throw new Error(`Assignments: ${assignmentsResult.error.message}`)
    }
    
    if (coursesResult.error) {
      console.error('Courses fetch error:', coursesResult.error)
      throw new Error(`Courses: ${coursesResult.error.message}`)
    }
    
    if (gradesResult.error) {
      console.error('Grades fetch error:', gradesResult.error)
      throw new Error(`Grades: ${gradesResult.error.message}`)
    }

    // Create courses map for efficient lookups
    const coursesMap = new Map(
      coursesResult.data?.map(course => [course.course_id, course]) || []
    )

    // Transform assignments with course enrichment
    const assignments = assignmentsResult.data?.map(assignment => ({
      id: assignment.assignment_id,
      name: assignment.name,
      description: assignment.description,
      due_at: assignment.due_at,
      points_possible: assignment.points_possible,
      course_id: assignment.course_id,
      submission_types: assignment.submission_types,
      html_url: assignment.html_url,
      course: coursesMap.get(assignment.course_id) ? {
        id: assignment.course_id,
        name: assignment.course_name,
        course_code: assignment.course_code
      } : null,
      submission: assignment.has_submission ? {
        id: `${assignment.assignment_id}_submission`,
        score: assignment.submission_score,
        submitted_at: assignment.submission_submitted_at,
        workflow_state: assignment.submission_workflow_state
      } : null,
      ...assignment.raw_data
    })) || []

    // Transform courses
    const courses = coursesResult.data?.map(course => ({
      id: course.course_id,
      name: course.name,
      course_code: course.course_code,
      start_at: course.start_at,
      end_at: course.end_at,
      workflow_state: course.workflow_state,
      ...course.raw_data
    })) || []

    // Transform grades
    const grades = gradesResult.data?.map(grade => ({
      id: grade.submission_id || grade.assignment_id,
      score: grade.score,
      points_possible: grade.points_possible,
      assignment_name: grade.assignment_name,
      course_name: grade.course_name,
      graded_at: grade.graded_at,
      ...grade.raw_data
    })) || []

    console.timeEnd('PARALLEL_FETCH_ALL')
    console.log(`✅ Parallel fetch complete: ${assignments.length} assignments, ${courses.length} courses, ${grades.length} grades`)

    // Check if any cache is empty
    const needsSync = assignments.length === 0 && courses.length === 0 && grades.length === 0

    // Return optimized response
    const jsonResponse = NextResponse.json({
      assignments,
      courses,
      grades,
      counts: {
        assignments: assignments.length,
        courses: courses.length,
        grades: grades.length
      },
      fromCache: true,
      parallel: true,
      needsSync,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
    // Preserve authentication cookies
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error: any) {
    console.timeEnd('PARALLEL_FETCH_ALL')
    console.error('❌ Parallel Canvas API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Canvas data in parallel',
      details: error.message,
      assignments: [],
      courses: [],
      grades: []
    }, { status: 500 })
  }
}
