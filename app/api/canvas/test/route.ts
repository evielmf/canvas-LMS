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

    // Validate Canvas URL format with more flexibility
    let normalizedUrl = canvasUrl.trim()
    
    // Remove trailing slashes
    normalizedUrl = normalizedUrl.replace(/\/+$/, '')
    
    // Add https:// if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }
    
    try {
      const url = new URL(normalizedUrl)
      
      // More flexible Canvas URL validation
      const hostname = url.hostname.toLowerCase()
      const isValidCanvas = (
        hostname.includes('canvas') || 
        hostname.includes('instructure') ||
        hostname.includes('.edu') ||
        // Allow any domain if it has a valid URL structure
        hostname.includes('.')
      )
      
      if (!isValidCanvas) {
        console.warn('⚠️ Canvas URL validation warning - unusual hostname:', hostname)
      }
      
      console.log('📍 Testing Canvas URL:', normalizedUrl)
      
    } catch (urlError) {
      return NextResponse.json(
        { 
          error: 'Invalid Canvas URL', 
          details: 'Please provide a valid Canvas URL (e.g., https://yourschool.instructure.com or https://canvas.yourschool.edu)',
          originalUrl: canvasUrl,
          normalizedUrl: normalizedUrl,
          urlError: (urlError as Error).message
        },
        { status: 400 }
      )
    }

    // Test Canvas API connection with enhanced error handling
    console.log('🧪 Testing Canvas API connection...')
    console.log('🔗 URL:', normalizedUrl)
    console.log('🔑 Token length:', canvasToken.length, 'characters')
    
    try {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 15000) // Increased to 15 seconds
      
      // Try different API endpoints in case /users/self doesn't work
      const testEndpoints = [
        `${normalizedUrl}/api/v1/users/self`,
        `${normalizedUrl}/api/v1/courses`,
        `${normalizedUrl}/api/v1/accounts/self`
      ]
      
      let canvasResponse
      let lastError
      
      for (const endpoint of testEndpoints) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint}`)
          
          canvasResponse = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${canvasToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Easeboard Canvas Integration v1.0'
            },
            signal: abortController.signal,
          })
          
          if (canvasResponse.ok) {
            console.log(`✅ Successful response from: ${endpoint}`)
            break
          } else {
            console.log(`❌ Failed response from ${endpoint}: ${canvasResponse.status}`)
            lastError = {
              endpoint,
              status: canvasResponse.status,
              statusText: canvasResponse.statusText
            }
          }
        } catch (endpointError) {
          console.log(`❌ Error testing ${endpoint}:`, endpointError)
          lastError = {
            endpoint,
            error: endpointError instanceof Error ? endpointError.message : String(endpointError)
          }
        }
      }
      
      clearTimeout(timeoutId)

      if (!canvasResponse || !canvasResponse.ok) {
        let errorDetails = 'Canvas API authentication failed'
        let troubleshooting: string[] = []
        
        if (lastError) {
          if ('status' in lastError && lastError.status === 401) {
            errorDetails = 'Invalid Canvas API token. The token was rejected by Canvas.'
            troubleshooting = [
              'Verify your token was copied correctly (no extra spaces)',
              'Check if the token has expired',
              'Ensure the token has proper permissions',
              'Try generating a new token from Canvas settings'
            ]
          } else if ('status' in lastError && lastError.status === 403) {
            errorDetails = 'Canvas API token does not have sufficient permissions.'
            troubleshooting = [
              'The token exists but lacks required permissions',
              'Try generating a new token with broader scope',
              'Contact your Canvas administrator for assistance'
            ]
          } else if ('status' in lastError && lastError.status === 404) {
            errorDetails = 'Canvas API endpoint not found. Please verify your Canvas URL.'
            troubleshooting = [
              'Check your Canvas URL is correct',
              'Ensure the URL includes the full domain (e.g., https://school.instructure.com)',
              'Try accessing your Canvas directly in a browser first'
            ]
          } else if ('status' in lastError && lastError.status && lastError.status >= 500) {
            errorDetails = 'Canvas server is experiencing issues. Please try again later.'
            troubleshooting = [
              'Canvas servers may be temporarily down',
              'Try again in a few minutes',
              'Check Canvas status page if available'
            ]
          } else if ('status' in lastError && lastError.status) {
            errorDetails = `Canvas API error (${lastError.status}): ${lastError.statusText || 'Unknown error'}`
            troubleshooting = [
              'This is an unusual error - please check your Canvas URL and token',
              'Try accessing Canvas directly in your browser',
              'Contact support if the issue persists'
            ]
          } else {
            errorDetails = 'Canvas API connection error'
            troubleshooting = [
              'Check your internet connection',
              'Verify the Canvas URL is accessible',
              'Try again in a few moments'
            ]
          }
        } else {
          errorDetails = 'Unable to connect to Canvas API - no response received'
          troubleshooting = [
            'Check your internet connection',
            'Verify the Canvas URL is accessible',
            'Try again in a few moments'
          ]
        }

        return NextResponse.json(
          { 
            error: 'Canvas API test failed', 
            details: errorDetails,
            troubleshooting,
            lastError,
            testedEndpoints: testEndpoints,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      const userData = await canvasResponse.json()
      console.log('✅ Canvas API test successful for user:', userData.name || userData.id || 'Unknown')

      // Save or update Canvas credentials
      const encryptedToken = encrypt(canvasToken)
      
      console.log('💾 Saving Canvas credentials to database...')
      
      const { error: dbError } = await supabase
        .from('canvas_tokens')
        .upsert(
          {
            user_id: user.id,
            canvas_url: normalizedUrl, // Use normalized URL
            encrypted_token: encryptedToken,
            token_name: userData.name || userData.login_id || 'Canvas User',
            last_validated: new Date().toISOString(),
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
            hint: dbError.hint,
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        )
      }

      console.log('✅ Canvas credentials saved successfully')

      return NextResponse.json({
        success: true,
        message: 'Canvas connection tested and credentials saved successfully',
        user: {
          name: userData.name || userData.login_id || 'Canvas User',
          id: userData.id,
          email: userData.email || userData.login_id || userData.primary_email,
        },
        canvasUrl: normalizedUrl,
        timestamp: new Date().toISOString()
      })

    } catch (fetchError) {
      console.error('❌ Canvas API fetch error:', fetchError)
      
      let errorMessage = 'Failed to connect to Canvas API'
      let troubleshooting: string[] = []
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Canvas API request timed out after 15 seconds'
          troubleshooting = [
            'Canvas may be responding slowly',
            'Check your internet connection',
            'Try again in a few moments',
            'Verify Canvas is accessible in your browser'
          ]
        } else if (fetchError.message.includes('ENOTFOUND') || fetchError.message.includes('getaddrinfo')) {
          errorMessage = 'Canvas URL not found. Please check the URL and try again.'
          troubleshooting = [
            'Verify your Canvas URL is correct',
            'Ensure you can access Canvas in your browser',
            'Check for typos in the URL',
            'Try the full URL including https://'
          ]
        } else if (fetchError.message.includes('ECONNREFUSED')) {
          errorMessage = 'Canvas server refused the connection'
          troubleshooting = [
            'Canvas may be temporarily unavailable',
            'Check if Canvas is accessible in your browser',
            'Try again in a few minutes'
          ]
        } else if (fetchError.message.includes('certificate') || fetchError.message.includes('SSL')) {
          errorMessage = 'SSL/Certificate error connecting to Canvas'
          troubleshooting = [
            'Canvas may have SSL certificate issues',
            'Try accessing Canvas in your browser first',
            'Contact your IT department if the issue persists'
          ]
        } else {
          errorMessage = `Connection error: ${fetchError.message}`
          troubleshooting = [
            'Check your internet connection',
            'Verify Canvas URL is accessible',
            'Try again in a few moments'
          ]
        }
      }

      return NextResponse.json(
        { 
          error: 'Canvas API connection failed', 
          details: errorMessage,
          troubleshooting,
          originalError: fetchError instanceof Error ? fetchError.message : String(fetchError),
          canvasUrl: normalizedUrl,
          timestamp: new Date().toISOString()
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
