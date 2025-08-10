// Migration script to fix course names in assignments cache
// This script can be run to update existing assignments with proper course names

import { createClient } from '@/utils/supabase/server'

export async function fixCourseNamesInCache() {
  console.log('🔧 Starting course name fix migration...')
  
  try {
    const supabase = await createClient()
    
    // Get all users who have canvas data
    const { data: users, error: usersError } = await supabase
      .from('canvas_tokens')
      .select('user_id')
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }
    
    console.log(`Found ${users.length} users with Canvas tokens`)
    
    for (const userRecord of users) {
      const userId = userRecord.user_id
      console.log(`\n👤 Processing user: ${userId}`)
      
      // Get courses for this user
      const { data: courses, error: coursesError } = await supabase
        .from('canvas_courses_cache')
        .select('canvas_course_id, name, course_code')
        .eq('user_id', userId)
      
      if (coursesError) {
        console.error(`Error fetching courses for user ${userId}:`, coursesError)
        continue
      }
      
      if (!courses || courses.length === 0) {
        console.log(`No courses found for user ${userId}`)
        continue
      }
      
      // Create course mapping
      const courseMap = new Map()
      courses.forEach(course => {
        courseMap.set(course.canvas_course_id, {
          name: course.name,
          code: course.course_code
        })
      })
      
      console.log(`📚 Found ${courses.length} courses for user`)
      
      // Get assignments that need course name fixes
      const { data: assignments, error: assignmentsError } = await supabase
        .from('canvas_assignments_cache')
        .select('id, canvas_assignment_id, course_id, name, course_name')
        .eq('user_id', userId)
        .or('course_name.eq.Unknown Course,course_name.is.null,course_name.eq.')
      
      if (assignmentsError) {
        console.error(`Error fetching assignments for user ${userId}:`, assignmentsError)
        continue
      }
      
      if (!assignments || assignments.length === 0) {
        console.log(`No assignments need fixing for user ${userId}`)
        continue
      }
      
      console.log(`📝 Found ${assignments.length} assignments that need course name fixes`)
      
      // Update assignments with proper course names
      const updatePromises = assignments.map(async (assignment) => {
        const courseInfo = courseMap.get(assignment.course_id)
        if (courseInfo) {
          const newCourseName = courseInfo.name || courseInfo.code || `Course ${assignment.course_id}`
          
          const { error: updateError } = await supabase
            .from('canvas_assignments_cache')
            .update({ course_name: newCourseName })
            .eq('id', assignment.id)
          
          if (updateError) {
            console.error(`Error updating assignment ${assignment.canvas_assignment_id}:`, updateError)
            return { success: false, assignmentId: assignment.canvas_assignment_id }
          }
          
          console.log(`✅ Updated "${assignment.name}" course name: "${assignment.course_name}" → "${newCourseName}"`)
          return { success: true, assignmentId: assignment.canvas_assignment_id, oldName: assignment.course_name, newName: newCourseName }
        } else {
          console.log(`⚠️  No course found for assignment "${assignment.name}" (course_id: ${assignment.course_id})`)
          return { success: false, assignmentId: assignment.canvas_assignment_id, reason: 'Course not found' }
        }
      })
      
      const results = await Promise.all(updatePromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      
      console.log(`📊 User ${userId} results: ${successful} updated, ${failed} failed`)
    }
    
    console.log('\n🎉 Course name fix migration completed!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// If this file is run directly
if (require.main === module) {
  fixCourseNamesInCache()
}
