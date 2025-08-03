import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: 'No user found'
      }, { status: 401 })
    }

    // Check if canvas_tokens table exists and get token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError) {
      return NextResponse.json({ 
        error: 'Canvas token error',
        debug: {
          code: tokenError.code,
          message: tokenError.message,
          details: tokenError.details
        }
      }, { status: 400 })
    }

    if (!tokenData) {
      return NextResponse.json({ 
        error: 'No Canvas token found',
        debug: 'User has not set up Canvas yet'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        tokenExists: !!tokenData,
        canvasUrl: tokenData.canvas_url,
        hasEncryptedToken: !!tokenData.encrypted_token
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        error: 'Debug API error',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
