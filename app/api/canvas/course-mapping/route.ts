import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function GET(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all course mappings for the user
    const { data: mappings, error: mappingsError } = await supabase
      .from('course_name_mappings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (mappingsError) {
      console.error('Error fetching course mappings:', mappingsError)
      return NextResponse.json({ error: 'Failed to fetch course mappings' }, { status: 500 })
    }

    const jsonResponse = NextResponse.json({ mappings: mappings || [] })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error) {
    console.error('Course mappings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { course_id, original_name, mapped_name } = body

    if (!course_id || !mapped_name) {
      return NextResponse.json({ error: 'Course ID and mapped name are required' }, { status: 400 })
    }

    // Insert or update course mapping
    const { data: mapping, error: mappingError } = await supabase
      .from('course_name_mappings')
      .upsert({
        user_id: user.id,
        course_id: course_id,
        original_name: original_name || null,
        mapped_name: mapped_name,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (mappingError) {
      console.error('Error creating/updating course mapping:', mappingError)
      return NextResponse.json({ error: 'Failed to save course mapping' }, { status: 500 })
    }

    const jsonResponse = NextResponse.json({ 
      mapping,
      message: 'Course mapping saved successfully'
    })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error) {
    console.error('Course mapping API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const course_id = searchParams.get('course_id')

    if (!course_id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Delete course mapping
    const { error: deleteError } = await supabase
      .from('course_name_mappings')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', course_id)

    if (deleteError) {
      console.error('Error deleting course mapping:', deleteError)
      return NextResponse.json({ error: 'Failed to delete course mapping' }, { status: 500 })
    }

    const jsonResponse = NextResponse.json({ 
      message: 'Course mapping deleted successfully'
    })
    
    // Copy cookies from supabase response
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error) {
    console.error('Course mapping delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
