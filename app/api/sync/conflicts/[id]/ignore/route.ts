import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

/**
 * POST /api/sync/conflicts/[id]/ignore
 * Ignore a specific sync conflict (keep cached data, mark as ignored)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { supabase } = createClient(request)
  
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

    console.log(`Ignoring conflict ${conflictId}:`, {
      type: conflict.item_type,
      field: conflict.field,
      keepingCachedValue: conflict.cached_value
    })

    // Mark conflict as ignored (no data changes)
    const { error: updateError } = await supabase
      .from('sync_conflicts')
      .update({
        status: 'ignored',
        resolved_at: new Date().toISOString(),
        resolved_by: 'user'
      })
      .eq('id', conflictId)

    if (updateError) {
      console.error('Error marking conflict as ignored:', updateError)
      return NextResponse.json({ 
        error: 'Failed to mark conflict as ignored',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log(`✅ Successfully ignored conflict ${conflictId}`)

    return NextResponse.json({
      success: true,
      message: 'Conflict ignored successfully',
      conflict: {
        id: conflictId,
        item_type: conflict.item_type,
        field: conflict.field,
        kept_value: conflict.cached_value
      }
    })

  } catch (error: any) {
    console.error('POST /api/sync/conflicts/[id]/ignore error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
