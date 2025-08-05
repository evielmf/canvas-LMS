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

    // Get study sessions for the user
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching study sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch study sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })

  } catch (error) {
    console.error('Study Sessions API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { course_id, course_name, duration_minutes, activity_type, notes } = body

    // Validate required fields
    if (!duration_minutes || duration_minutes <= 0) {
      return NextResponse.json({ error: 'Duration is required and must be positive' }, { status: 400 })
    }

    // Create new study session
    const { data: session, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        course_id,
        course_name,
        duration_minutes,
        activity_type: activity_type || 'study',
        notes,
        started_at: new Date(Date.now() - duration_minutes * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating study session:', error)
      return NextResponse.json({ error: 'Failed to create study session' }, { status: 500 })
    }

    return NextResponse.json({ session })

  } catch (error) {
    console.error('Study Sessions API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    )
  }
}
