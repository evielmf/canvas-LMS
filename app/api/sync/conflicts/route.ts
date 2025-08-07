import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

/**
 * GET /api/sync/conflicts
 * Fetch all unresolved sync conflicts for the authenticated user
 */
export async function GET(request: NextRequest) {
  const { supabase } = createClient(request)
  
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'unresolved'
    const itemType = searchParams.get('item_type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('sync_conflicts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('detected_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by item type if specified
    if (itemType && ['assignment', 'course', 'grade'].includes(itemType)) {
      query = query.eq('item_type', itemType)
    }

    const { data: conflicts, error } = await query

    if (error) {
      console.error('Error fetching sync conflicts:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch conflicts',
        details: error.message 
      }, { status: 500 })
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from('sync_conflicts')
      .select('status, item_type')
      .eq('user_id', user.id)

    const summary = stats?.reduce((acc: any, conflict: any) => {
      const key = `${conflict.status}_${conflict.item_type}`
      acc[key] = (acc[key] || 0) + 1
      acc[`total_${conflict.status}`] = (acc[`total_${conflict.status}`] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      conflicts: conflicts || [],
      summary,
      pagination: {
        limit,
        offset,
        total: conflicts?.length || 0
      }
    })

  } catch (error: any) {
    console.error('GET /api/sync/conflicts error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

/**
 * POST /api/sync/conflicts
 * Resolve or ignore specific sync conflicts
 */
export async function POST(request: NextRequest) {
  const { supabase } = createClient(request)
  
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conflictIds, action, batchResolve = false } = body

    // Validate input
    if (!conflictIds || !Array.isArray(conflictIds) || conflictIds.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request: conflictIds array is required' 
      }, { status: 400 })
    }

    if (!['resolve', 'ignore'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action: must be either "resolve" or "ignore"' 
      }, { status: 400 })
    }

    console.log(`${action.toUpperCase()} conflicts:`, conflictIds)

    // Get the conflicts to resolve/ignore
    const { data: conflicts, error: fetchError } = await supabase
      .from('sync_conflicts')
      .select('*')
      .eq('user_id', user.id)
      .in('id', conflictIds)
      .eq('status', 'unresolved')

    if (fetchError) {
      console.error('Error fetching conflicts:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch conflicts',
        details: fetchError.message 
      }, { status: 500 })
    }

    if (!conflicts || conflicts.length === 0) {
      return NextResponse.json({ 
        error: 'No unresolved conflicts found with provided IDs' 
      }, { status: 404 })
    }

    let resolvedCount = 0
    const errors: string[] = []

    if (action === 'resolve') {
      // For resolve action, update the cached data to match live values
      for (const conflict of conflicts) {
        try {
          await resolveConflictData(supabase, conflict)
          resolvedCount++
        } catch (error: any) {
          console.error(`Failed to resolve conflict ${conflict.id}:`, error)
          errors.push(`Conflict ${conflict.id}: ${error.message}`)
        }
      }
    }

    // Update conflict status
    const newStatus = action === 'resolve' ? 'resolved' : 'ignored'
    const { error: updateError } = await supabase
      .from('sync_conflicts')
      .update({
        status: newStatus,
        resolved_at: new Date().toISOString(),
        resolved_by: batchResolve ? 'auto' : 'user'
      })
      .eq('user_id', user.id)
      .in('id', conflictIds)

    if (updateError) {
      console.error('Error updating conflict status:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update conflicts',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log(`✅ Successfully ${action}d ${conflictIds.length} conflicts`)

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${conflictIds.length} conflicts`,
      resolvedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('POST /api/sync/conflicts error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

/**
 * Helper function to resolve conflict data by updating cache to match live values
 */
async function resolveConflictData(supabase: any, conflict: any): Promise<void> {
  const { item_type, item_id, field, live_value } = conflict

  switch (item_type) {
    case 'assignment':
      if (field === 'existence' && live_value === 'deleted') {
        // Delete assignment from cache
        await supabase
          .from('canvas_assignments_cache')
          .delete()
          .eq('canvas_assignment_id', item_id)
      } else if (field === 'existence' && live_value === 'exists') {
        // This would require fetching the assignment from Canvas API
        // For now, we'll skip this and let the next sync handle it
        console.log(`Skipping new assignment ${item_id} - will be handled by next sync`)
      } else {
        // Update specific field
        const updateData: any = {}
        updateData[field] = live_value
        updateData.updated_at = new Date().toISOString()
        
        await supabase
          .from('canvas_assignments_cache')
          .update(updateData)
          .eq('canvas_assignment_id', item_id)
      }
      break

    case 'course':
      if (field === 'existence' && live_value === 'deleted') {
        // Delete course from cache
        await supabase
          .from('canvas_courses_cache')
          .delete()
          .eq('canvas_course_id', item_id)
      } else if (field === 'existence' && live_value === 'exists') {
        // Skip new courses - let next sync handle
        console.log(`Skipping new course ${item_id} - will be handled by next sync`)
      } else {
        // Update specific field
        const updateData: any = {}
        updateData[field] = live_value
        updateData.updated_at = new Date().toISOString()
        
        await supabase
          .from('canvas_courses_cache')
          .update(updateData)
          .eq('canvas_course_id', item_id)
      }
      break

    case 'grade':
      // For grades, update the assignment's submission data
      const updateData: any = {}
      if (field.startsWith('submission_')) {
        updateData[field] = live_value
      } else {
        updateData[field] = live_value
      }
      updateData.updated_at = new Date().toISOString()
      
      await supabase
        .from('canvas_assignments_cache')
        .update(updateData)
        .eq('canvas_assignment_id', item_id)
      break

    default:
      throw new Error(`Unknown item type: ${item_type}`)
  }
}
