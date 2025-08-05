import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function DELETE(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all Canvas tokens for this user
    const { error: deleteError } = await supabase
      .from('canvas_tokens')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting Canvas tokens:', deleteError)
      return NextResponse.json({ error: 'Failed to clear Canvas tokens' }, { status: 500 })
    }

    console.log('✅ Successfully cleared Canvas tokens for user:', user.id)
    return NextResponse.json({ message: 'Canvas tokens cleared successfully' })

  } catch (error) {
    console.error('Error clearing Canvas tokens:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
