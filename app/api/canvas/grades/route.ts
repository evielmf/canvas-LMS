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
    
    // Fetch cached assignments data from Supabase
    const { data: assignmentsData, error } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(parseInt(limit))
    
    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch grades',
        details: error.message 
      }, { status: 500 })
    }

    // Transform cached assignment data to grades format
    const grades = assignmentsData?.map((assignment: any) => ({
      id: `${assignment.canvas_assignment_id}_grade`,
      score: assignment.score || 0,
      points_possible: assignment.points_possible || 0,
      assignment_name: assignment.name || 'Unknown Assignment',
      course_name: assignment.course_name || 'Unknown Course',
      course_id: assignment.course_id,
      graded_at: assignment.submitted_at || assignment.synced_at,
      assignment_id: assignment.canvas_assignment_id,
      percentage: assignment.points_possible > 0 
        ? Math.round((assignment.score / assignment.points_possible) * 100) 
        : 0
    })) || []

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
