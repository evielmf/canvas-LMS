import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  console.log('🔧 Starting course name fix migration...')
  
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log(`👤 Processing user: ${user.id}`)
    
    // Get courses for this user
    const { data: courses, error: coursesError } = await supabase
      .from('canvas_courses_cache')
      .select('canvas_course_id, name, course_code')
      .eq('user_id', user.id)
    
    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }
    
    if (!courses || courses.length === 0) {
      return NextResponse.json({ 
        message: 'No courses found. Please sync Canvas data first.',
        updated: 0,
        failed: 0
      })
    }
    
    // Create course mapping
    const courseMap = new Map()
    courses.forEach(course => {
      courseMap.set(course.canvas_course_id, {
        name: course.name,
        code: course.course_code
      })
    })
    
    console.log(`📚 Found ${courses.length} courses`)
    
    // Get assignments that need course name fixes
    const { data: assignments, error: assignmentsError } = await supabase
      .from('canvas_assignments_cache')
      .select('id, canvas_assignment_id, course_id, name, course_name')
      .eq('user_id', user.id)
      .or('course_name.eq.Unknown Course,course_name.is.null,course_name.eq.')
    
    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }
    
    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ 
        message: 'No assignments need course name fixes',
        updated: 0,
        failed: 0
      })
    }
    
    console.log(`📝 Found ${assignments.length} assignments that need course name fixes`)
    
    // Update assignments with proper course names
    let successful = 0
    let failed = 0
    const updates: any[] = []
    
    for (const assignment of assignments) {
      const courseInfo = courseMap.get(assignment.course_id)
      if (courseInfo) {
        const newCourseName = courseInfo.name || courseInfo.code || `Course ${assignment.course_id}`
        
        const { error: updateError } = await supabase
          .from('canvas_assignments_cache')
          .update({ course_name: newCourseName })
          .eq('id', assignment.id)
        
        if (updateError) {
          console.error(`Error updating assignment ${assignment.canvas_assignment_id}:`, updateError)
          failed++
        } else {
          successful++
          updates.push({
            assignment: assignment.name,
            oldName: assignment.course_name || 'Unknown Course',
            newName: newCourseName
          })
          console.log(`✅ Updated "${assignment.name}" course name: "${assignment.course_name || 'Unknown Course'}" → "${newCourseName}"`)
        }
      } else {
        console.log(`⚠️  No course found for assignment "${assignment.name}" (course_id: ${assignment.course_id})`)
        failed++
      }
    }
    
    console.log(`📊 Results: ${successful} updated, ${failed} failed`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${successful} assignments with proper course names`,
      updated: successful,
      failed: failed,
      totalProcessed: assignments.length,
      updates: updates.slice(0, 10) // Show first 10 updates as examples
    })
    
  } catch (error: any) {
    console.error('Migration failed:', error)
    return NextResponse.json({ 
      error: 'Failed to fix course names',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check how many assignments have unknown course names
    const { data: unknownAssignments, error } = await supabase
      .from('canvas_assignments_cache')
      .select('canvas_assignment_id, name, course_name, course_id')
      .eq('user_id', user.id)
      .or('course_name.eq.Unknown Course,course_name.is.null,course_name.eq.')
    
    if (error) {
      return NextResponse.json({ error: 'Failed to check assignments' }, { status: 500 })
    }
    
    return NextResponse.json({
      needsFix: unknownAssignments?.length > 0,
      unknownCount: unknownAssignments?.length || 0,
      examples: unknownAssignments?.slice(0, 5).map(a => ({
        name: a.name,
        courseName: a.course_name || 'null',
        courseId: a.course_id
      })) || []
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to check course names',
      details: error.message 
    }, { status: 500 })
  }
}
