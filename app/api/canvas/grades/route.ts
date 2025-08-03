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
      return NextResponse.json({ grades: [] })
    }

    let allGrades: any[] = []

    // Fetch grades for each course
    for (const course of courses) {
      try {
        const gradesResponse = await fetch(
          `${tokenData.canvas_url}/api/v1/courses/${course.canvas_course_id}/students/self/submissions?include[]=assignment&per_page=100`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (gradesResponse.ok) {
          const submissions = await gradesResponse.json()
          
          // Filter for graded submissions and format as grades
          const grades = submissions
            .filter((submission: any) => submission.score !== null && submission.assignment)
            .map((submission: any) => ({
              id: submission.id,
              score: submission.score,
              points_possible: submission.assignment.points_possible,
              assignment_name: submission.assignment.name,
              course_name: course.name,
              course_code: course.course_code,
              graded_at: submission.graded_at,
              assignment_id: submission.assignment.id,
              percentage: submission.assignment.points_possible > 0 
                ? Math.round((submission.score / submission.assignment.points_possible) * 100) 
                : 0
            }))

          allGrades = [...allGrades, ...grades]
        }
      } catch (error) {
        console.error(`Error fetching grades for course ${course.canvas_course_id}:`, error)
      }
    }

    // Sort grades by graded date (most recent first)
    allGrades.sort((a, b) => new Date(b.graded_at).getTime() - new Date(a.graded_at).getTime())

    return NextResponse.json({ grades: allGrades })

  } catch (error) {
    console.error('Error fetching Canvas grades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
