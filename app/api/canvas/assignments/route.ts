import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'
import CryptoJS from 'crypto-js'

const decryptToken = (encryptedToken: string) => {
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'canvas-dashboard-key'
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Error decrypting token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Canvas token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'No Canvas token found' }, { status: 404 })
    }

    const token = decryptToken(tokenData.encrypted_token)
    if (!token) {
      return NextResponse.json({ error: 'Failed to decrypt token' }, { status: 400 })
    }

    // Get cached courses first
    const { data: courses } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)

    if (!courses || courses.length === 0) {
      return NextResponse.json({ assignments: [] })
    }

    let allAssignments: any[] = []

    // Fetch assignments for each course
    for (const course of courses) {
      try {
        const assignmentsResponse = await fetch(
          `${tokenData.canvas_url}/api/v1/courses/${course.canvas_course_id}/assignments?per_page=100&include[]=submission`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (assignmentsResponse.ok) {
          const assignments = await assignmentsResponse.json()
          
          // Add course info to each assignment
          const enrichedAssignments = assignments.map((assignment: any) => ({
            ...assignment,
            course_name: course.name,
            course_code: course.course_code,
          }))

          allAssignments = [...allAssignments, ...enrichedAssignments]

          // Cache assignments in database
          for (const assignment of assignments) {
            await supabase
              .from('canvas_assignments_cache')
              .upsert({
                user_id: user.id,
                canvas_assignment_id: assignment.id,
                course_id: course.canvas_course_id,
                name: assignment.name,
                due_at: assignment.due_at,
                points_possible: assignment.points_possible,
                submission_types: assignment.submission_types,
                html_url: assignment.html_url,
                description: assignment.description,
                submitted_at: assignment.submission?.submitted_at,
                score: assignment.submission?.score,
                synced_at: new Date().toISOString(),
              })
          }
        }
      } catch (error) {
        console.error(`Error fetching assignments for course ${course.canvas_course_id}:`, error)
      }
    }

    return NextResponse.json({ assignments: allAssignments })

  } catch (error) {
    console.error('Error fetching Canvas assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
