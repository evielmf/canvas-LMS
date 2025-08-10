import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Fetch user's schedule items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch schedule items for the user
    const { data: scheduleItems, error: scheduleError } = await supabase
      .from('weekly_schedule')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (scheduleError) {
      console.error('Error fetching schedule:', scheduleError)
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
    }

    return NextResponse.json({ 
      scheduleItems: scheduleItems || [],
      count: scheduleItems?.length || 0
    })

  } catch (error: any) {
    console.error('Schedule API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch schedule',
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Create new schedule item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, course_name, day_of_week, start_time, end_time, location, color } = body

    // Validate required fields
    if (!title || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, day_of_week, start_time, end_time' 
      }, { status: 400 })
    }

    // Insert new schedule item
    const { data, error } = await supabase
      .from('weekly_schedule')
      .insert([{
        user_id: user.id,
        title,
        course_name: course_name || null,
        day_of_week: parseInt(day_of_week),
        start_time,
        end_time,
        location: location || null,
        color: color || '#3B82F6'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating schedule item:', error)
      return NextResponse.json({ error: 'Failed to create schedule item' }, { status: 500 })
    }

    return NextResponse.json({ 
      scheduleItem: data,
      message: 'Schedule item created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Schedule creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create schedule item',
      details: error.message 
    }, { status: 500 })
  }
}

// PUT - Update schedule item
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, course_name, day_of_week, start_time, end_time, location, color } = body

    if (!id) {
      return NextResponse.json({ error: 'Schedule item ID is required' }, { status: 400 })
    }

    // Update schedule item
    const { data, error } = await supabase
      .from('weekly_schedule')
      .update({
        title,
        course_name: course_name || null,
        day_of_week: day_of_week ? parseInt(day_of_week) : undefined,
        start_time,
        end_time,
        location: location || null,
        color: color || '#3B82F6'
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own items
      .select()
      .single()

    if (error) {
      console.error('Error updating schedule item:', error)
      return NextResponse.json({ error: 'Failed to update schedule item' }, { status: 500 })
    }

    return NextResponse.json({ 
      scheduleItem: data,
      message: 'Schedule item updated successfully'
    })

  } catch (error: any) {
    console.error('Schedule update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update schedule item',
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE - Delete schedule item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Schedule item ID is required' }, { status: 400 })
    }

    // Delete schedule item
    const { error } = await supabase
      .from('weekly_schedule')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only delete their own items

    if (error) {
      console.error('Error deleting schedule item:', error)
      return NextResponse.json({ error: 'Failed to delete schedule item' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Schedule item deleted successfully'
    })

  } catch (error: any) {
    console.error('Schedule deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete schedule item',
      details: error.message 
    }, { status: 500 })
  }
}
