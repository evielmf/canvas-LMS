import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

/**
 * POST /api/sync/conflicts/[id]/resolve
 * Resolve a specific sync conflict by updating cached data to match live Canvas data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = createClient(request)
  const { id } = await params
  
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conflictId = id
    if (!conflictId) {
      return NextResponse.json({ error: 'Conflict ID is required' }, { status: 400 })
    }

    // Get the conflict
    const { data: conflict, error: fetchError } = await supabase
      .from('sync_conflicts')
      .select('*')
      .eq('id', conflictId)
      .eq('user_id', user.id)
      .eq('status', 'unresolved')
      .single()

    if (fetchError || !conflict) {
      return NextResponse.json({ 
        error: 'Conflict not found or already resolved' 
      }, { status: 404 })
    }

    console.log(`Resolving conflict ${conflictId}:`, {
      type: conflict.item_type,
      field: conflict.field,
      cached: conflict.cached_value,
      live: conflict.live_value
    })

    // Resolve the conflict by updating cached data
    try {
      await resolveConflictData(supabase, conflict)
    } catch (resolveError: any) {
      console.error('Failed to resolve conflict data:', resolveError)
      return NextResponse.json({ 
        error: 'Failed to resolve conflict data',
        details: resolveError.message 
      }, { status: 500 })
    }

    // Mark conflict as resolved
    const { error: updateError } = await supabase
      .from('sync_conflicts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: 'user'
      })
      .eq('id', conflictId)

    if (updateError) {
      console.error('Error marking conflict as resolved:', updateError)
      return NextResponse.json({ 
        error: 'Failed to mark conflict as resolved',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log(`✅ Successfully resolved conflict ${conflictId}`)

    return NextResponse.json({
      success: true,
      message: 'Conflict resolved successfully',
      conflict: {
        id: conflictId,
        item_type: conflict.item_type,
        field: conflict.field,
        resolved_value: conflict.live_value
      }
    })

  } catch (error: any) {
    console.error('POST /api/sync/conflicts/[id]/resolve error:', error)
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
        const { error } = await supabase
          .from('canvas_assignments_cache')
          .delete()
          .eq('canvas_assignment_id', item_id)
        
        if (error) throw new Error(`Failed to delete assignment: ${error.message}`)
        
      } else if (field === 'existence' && live_value === 'exists') {
        // This would require fetching the assignment from Canvas API
        // For now, we'll skip this and let the next sync handle it
        console.log(`Skipping new assignment ${item_id} - will be handled by next sync`)
        
      } else {
        // Update specific field
        const updateData: any = {}
        updateData[field] = live_value
        updateData.updated_at = new Date().toISOString()
        
        const { error } = await supabase
          .from('canvas_assignments_cache')
          .update(updateData)
          .eq('canvas_assignment_id', item_id)
        
        if (error) throw new Error(`Failed to update assignment: ${error.message}`)
      }
      break

    case 'course':
      if (field === 'existence' && live_value === 'deleted') {
        // Delete course from cache
        const { error } = await supabase
          .from('canvas_courses_cache')
          .delete()
          .eq('canvas_course_id', item_id)
        
        if (error) throw new Error(`Failed to delete course: ${error.message}`)
        
      } else if (field === 'existence' && live_value === 'exists') {
        // Skip new courses - let next sync handle
        console.log(`Skipping new course ${item_id} - will be handled by next sync`)
        
      } else {
        // Update specific field
        const updateData: any = {}
        updateData[field] = live_value
        updateData.updated_at = new Date().toISOString()
        
        const { error } = await supabase
          .from('canvas_courses_cache')
          .update(updateData)
          .eq('canvas_course_id', item_id)
        
        if (error) throw new Error(`Failed to update course: ${error.message}`)
      }
      break

    case 'grade':
      // For grades, update the assignment's submission data
      const updateData: any = {}
      updateData[field] = live_value
      updateData.updated_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('canvas_assignments_cache')
        .update(updateData)
        .eq('canvas_assignment_id', item_id)
      
      if (error) throw new Error(`Failed to update grade: ${error.message}`)
      break

    default:
      throw new Error(`Unknown item type: ${item_type}`)
  }
}
