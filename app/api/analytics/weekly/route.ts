import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing Canvas data to calculate analytics
    const { data: assignments } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)

    const { data: courses } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)

    // Calculate weekly productivity insights
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of current week
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    if (!assignments) {
      return NextResponse.json({
        weeklyProductivity: {
          assignmentsDue: 0,
          assignmentsCompleted: 0,
          completionRate: 0,
          totalCourses: courses?.length || 0
        }
      })
    }

    // Filter assignments for this week
    const thisWeekAssignments = assignments.filter(assignment => {
      if (!assignment.due_at) return false
      const dueDate = new Date(assignment.due_at)
      return dueDate >= startOfWeek && dueDate < endOfWeek
    })

    const assignmentsDue = thisWeekAssignments.length
    const assignmentsCompleted = thisWeekAssignments.filter(
      assignment => assignment.has_submission && assignment.submission_submitted_at
    ).length

    const completionRate = assignmentsDue > 0 ? (assignmentsCompleted / assignmentsDue) * 100 : 0

    return NextResponse.json({
      weeklyProductivity: {
        assignmentsDue,
        assignmentsCompleted,
        completionRate: Math.round(completionRate),
        totalCourses: courses?.length || 0,
        weekStart: startOfWeek.toISOString(),
        weekEnd: endOfWeek.toISOString()
      }
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
