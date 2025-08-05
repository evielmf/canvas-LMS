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

    // Get existing Canvas data to calculate grade trends
    const { data: assignments } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })

    if (!assignments) {
      return NextResponse.json({ gradeTrends: [] })
    }

    // Filter assignments with grades and sort by submission date
    const gradedAssignments = assignments
      .filter(assignment => 
        assignment.submission_score !== null && 
        assignment.submission_score !== undefined &&
        assignment.submission_submitted_at
      )
      .sort((a, b) => 
        new Date(a.submission_submitted_at!).getTime() - 
        new Date(b.submission_submitted_at!).getTime()
      )

    // Create trend data points
    const trendData = gradedAssignments.map((assignment, index) => {
      const submittedDate = new Date(assignment.submission_submitted_at!)
      const percentage = assignment.points_possible > 0 ? 
        (assignment.submission_score! / assignment.points_possible) * 100 : 0

      // Calculate running average
      const previousAssignments = gradedAssignments.slice(0, index + 1)
      const runningAverage = previousAssignments.reduce((sum, prev) => {
        const prevPercentage = prev.points_possible > 0 ? 
          (prev.submission_score! / prev.points_possible) * 100 : 0
        return sum + prevPercentage
      }, 0) / previousAssignments.length

      return {
        date: submittedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        grade: Math.round(percentage),
        runningAverage: Math.round(runningAverage),
        assignmentName: assignment.name,
        courseName: assignment.course_name,
        pointsEarned: assignment.submission_score,
        pointsPossible: assignment.points_possible
      }
    })

    // Calculate grade distribution
    const gradeDistribution = gradedAssignments.reduce((acc, assignment) => {
      const percentage = assignment.points_possible > 0 ? 
        (assignment.submission_score! / assignment.points_possible) * 100 : 0

      if (percentage >= 90) acc.A++
      else if (percentage >= 80) acc.B++
      else if (percentage >= 70) acc.C++
      else if (percentage >= 60) acc.D++
      else acc.F++

      return acc
    }, { A: 0, B: 0, C: 0, D: 0, F: 0 })

    return NextResponse.json({ 
      gradeTrends: trendData,
      gradeDistribution,
      totalGradedAssignments: gradedAssignments.length
    })

  } catch (error) {
    console.error('Grade Trends API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grade trends data' },
      { status: 500 }
    )
  }
}
