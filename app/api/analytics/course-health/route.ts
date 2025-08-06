import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing Canvas data to calculate course health
    const { data: assignments } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)

    const { data: courses } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)

    if (!assignments || !courses) {
      return NextResponse.json({ courseHealth: [] })
    }

    // Calculate health score for each course
    const courseHealth = courses.map(course => {
      const courseAssignments = assignments.filter(
        assignment => assignment.course_id === course.course_id
      )

      const totalAssignments = courseAssignments.length
      const completedAssignments = courseAssignments.filter(
        assignment => assignment.has_submission && assignment.submission_submitted_at
      ).length

      const completionRate = totalAssignments > 0 ? 
        (completedAssignments / totalAssignments) * 100 : 0

      // Calculate average grade for submitted assignments
      const gradedAssignments = courseAssignments.filter(
        assignment => assignment.submission_score !== null && assignment.submission_score !== undefined
      )

      const averageGrade = gradedAssignments.length > 0 ?
        gradedAssignments.reduce((sum, assignment) => sum + (assignment.submission_score || 0), 0) / gradedAssignments.length : 0

      // Health score calculation (0-100)
      // 40% completion rate + 40% grade average + 20% engagement (activity)
      const gradeWeight = gradedAssignments.length > 0 ? (averageGrade / 100) * 40 : 0
      const completionWeight = (completionRate / 100) * 40
      const engagementWeight = Math.min(totalAssignments / 5, 1) * 20 // More assignments = higher engagement

      const healthScore = Math.round(gradeWeight + completionWeight + engagementWeight)

      return {
        courseId: course.course_id,
        courseName: course.name,
        courseCode: course.course_code,
        healthScore,
        completionRate: Math.round(completionRate),
        averageGrade: Math.round(averageGrade),
        totalAssignments,
        completedAssignments,
        gradedAssignments: gradedAssignments.length
      }
    })

    return NextResponse.json({ courseHealth })

  } catch (error) {
    console.error('Course Health API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course health data' },
      { status: 500 }
    )
  }
}
