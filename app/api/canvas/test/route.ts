import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.CANVAS_ENCRYPTION_KEY || 'your-32-character-secret-key-here'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', details: userError?.message },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { canvasUrl, canvasToken } = body

    if (!canvasUrl || !canvasToken) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: 'Both canvasUrl and canvasToken are required',
          received: { canvasUrl: !!canvasUrl, canvasToken: !!canvasToken }
        },
        { status: 400 }
      )
    }

    // Validate Canvas URL format
    try {
      const url = new URL(canvasUrl)
      if (!url.hostname.includes('canvas') && !url.hostname.includes('instructure')) {
        console.warn('⚠️ Canvas URL validation warning:', url.hostname)
      }
    } catch (urlError) {
      return NextResponse.json(
        { 
          error: 'Invalid Canvas URL', 
          details: 'Please provide a valid Canvas URL (e.g., https://yourschool.instructure.com)',
          urlError: (urlError as Error).message
        },
        { status: 400 }
      )
    }

    // Test Canvas API connection
    console.log('🧪 Testing Canvas API connection...')
    
    try {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 10000) // 10 second timeout
      
      const canvasResponse = await fetch(`${canvasUrl}/api/v1/users/self`, {
        headers: {
          'Authorization': `Bearer ${canvasToken}`,
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
      })
      
      clearTimeout(timeoutId)

      if (!canvasResponse.ok) {
        const errorText = await canvasResponse.text()
        let errorDetails = 'Canvas API authentication failed'
        
        if (canvasResponse.status === 401) {
          errorDetails = 'Invalid Canvas API token. Please check your token and try again.'
        } else if (canvasResponse.status === 403) {
          errorDetails = 'Canvas API token does not have sufficient permissions.'
        } else if (canvasResponse.status === 404) {
          errorDetails = 'Canvas API endpoint not found. Please check your Canvas URL.'
        } else {
          errorDetails = `Canvas API error (${canvasResponse.status}): ${errorText}`
        }

        return NextResponse.json(
          { 
            error: 'Canvas API test failed', 
            details: errorDetails,
            status: canvasResponse.status,
            response: errorText.substring(0, 200) // Limit error response length
          },
          { status: 400 }
        )
      }

      const userData = await canvasResponse.json()
      console.log('✅ Canvas API test successful:', userData.name || userData.id)

      // Save or update Canvas credentials
      const encryptedToken = encrypt(canvasToken)
      
      console.log('💾 Saving Canvas credentials to database...')
      
      const { error: dbError } = await supabase
        .from('canvas_tokens')
        .upsert(
          {
            user_id: user.id,
            canvas_url: canvasUrl.trim(),
            encrypted_token: encryptedToken,
            token_name: userData.name || 'Canvas User',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )

      if (dbError) {
        console.error('❌ Database error:', dbError)
        return NextResponse.json(
          { 
            error: 'Failed to save Canvas credentials', 
            details: dbError.message,
            code: dbError.code,
            hint: dbError.hint
          },
          { status: 500 }
        )
      }

      console.log('✅ Canvas credentials saved successfully')

      return NextResponse.json({
        success: true,
        message: 'Canvas connection tested and credentials saved successfully',
        user: {
          name: userData.name,
          id: userData.id,
          email: userData.email || userData.login_id,
        },
        canvasUrl: canvasUrl.trim(),
      })

    } catch (fetchError) {
      console.error('❌ Canvas API fetch error:', fetchError)
      
      let errorMessage = 'Failed to connect to Canvas API'
      if (fetchError instanceof Error) {
        if (fetchError.message.includes('timeout')) {
          errorMessage = 'Canvas API request timed out. Please try again.'
        } else if (fetchError.message.includes('ENOTFOUND')) {
          errorMessage = 'Canvas URL not found. Please check the URL and try again.'
        } else {
          errorMessage = `Connection error: ${fetchError.message}`
        }
      }

      return NextResponse.json(
        { 
          error: 'Canvas API connection failed', 
          details: errorMessage,
          originalError: fetchError instanceof Error ? fetchError.message : String(fetchError)
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Canvas test API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
