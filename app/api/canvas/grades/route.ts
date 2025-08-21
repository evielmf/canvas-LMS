import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const startTime = performance.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    
    console.log('Fetching grades from cache...')
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch cached assignments data from Supabase for this user
    const { data: assignmentsData, error } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))
    
    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch grades',
        details: error.message 
      }, { status: 500 })
    }

    // Get courses from cache for proper course name enrichment
    const { data: coursesData } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)

    // Create course mapping with both string and number keys for better matching
    const coursesMap = new Map()
    coursesData?.forEach(course => {
      // Add both string and number versions of the course ID
      coursesMap.set(course.canvas_course_id, course)
      coursesMap.set(course.canvas_course_id.toString(), course)
      coursesMap.set(parseInt(course.canvas_course_id), course)
    })
    
    // Debug logging
    console.log(`Found ${coursesData?.length || 0} courses in cache`)
    if (coursesData && coursesData.length > 0) {
      console.log('Available courses:', coursesData.map(c => `ID: ${c.canvas_course_id}, Name: "${c.name}"`).join(', '))
    }

    // Transform cached assignment data to grades format with proper course names
    const grades = assignmentsData?.filter(assignment => assignment.score != null)
      .map((assignment: any) => {
        // Try multiple course ID formats for matching
        const course = coursesMap.get(assignment.course_id) || 
                    coursesMap.get(assignment.course_id?.toString()) || 
                    coursesMap.get(parseInt(assignment.course_id))
        
        let courseName = 'Unknown Course'
        
        if (course && course.name) {
          courseName = course.name
        } else if (course && course.course_code) {
          courseName = course.course_code
        } else if (course) {
          courseName = `Course ${assignment.course_id}`
        } else {
          console.log(`❌ No course found for assignment "${assignment.name}" with course_id: ${assignment.course_id} (type: ${typeof assignment.course_id})`)
          // List available course IDs for debugging
          const availableIds = Array.from(coursesMap.keys()).filter((key, index, array) => array.indexOf(key) === index)
          console.log(`Available course IDs in cache: [${availableIds.join(', ')}]`)
          courseName = `Course ${assignment.course_id}` // Fallback
        }
        
        // Additional debug for successful matches
        if (course) {
          console.log(`✅ Matched assignment "${assignment.name}" with course "${courseName}"`)
        }
        
        return {
          id: `${assignment.canvas_assignment_id}_grade`,
          score: assignment.score || 0,
          points_possible: assignment.points_possible || 0,
          assignment_name: assignment.name || 'Unknown Assignment',
          course_name: courseName,
          course_id: assignment.course_id,
          graded_at: assignment.submitted_at || assignment.created_at,
          assignment_id: assignment.canvas_assignment_id,
          percentage: assignment.points_possible > 0 
            ? Math.round((assignment.score / assignment.points_possible) * 100) 
            : 0
        }
      }) || []

    const totalTime = performance.now() - startTime
    console.log(`Successfully fetched ${grades.length} grades from cache in ${totalTime.toFixed(2)}ms`)

    // Check if cache is empty and suggest sync
    if (grades.length === 0) {
      return NextResponse.json({ 
        grades: [],
        count: 0,
        needsSync: true,
        message: 'No grades found in cache. Please sync Canvas data.',
        cached: false,
        response_time_ms: totalTime
      }, { status: 200 })
    }

    // Return successful response with performance metrics
    return NextResponse.json({ 
      grades,
      count: grades.length,
      cached: true,
      response_time_ms: totalTime,
      source: 'database_cache',
      fromCache: true
    }, { status: 200 })

  } catch (error: any) {
    const errorTime = performance.now() - startTime
    console.error('Grades API error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to fetch grades',
      details: error.message,
      response_time_ms: errorTime
    }, { status: 500 })
  }
}
