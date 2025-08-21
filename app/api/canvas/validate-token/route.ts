import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'

export async function POST(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.log('🔍 Validating Canvas token...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized', valid: false }, { status: 401 })
    }

    // Get Canvas token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('canvas_url, encrypted_token, last_sync')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      console.error('Canvas token not found:', tokenError)
      return NextResponse.json({ 
        error: 'Canvas token not configured', 
        valid: false,
        needsSetup: true
      }, { status: 400 })
    }

    const { canvas_url, encrypted_token } = tokenData
    
    // Decrypt token
    const crypto = require('crypto')
    const encryptionKey = process.env.CANVAS_ENCRYPTION_KEY || 'your-32-character-secret-key-here'
    let apiToken: string
    
    try {
      // Parse encrypted data
      const textParts = encrypted_token.split(':')
      const iv = Buffer.from(textParts.shift()!, 'hex')
      const encryptedText = textParts.join(':')
      
      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey.slice(0, 32), 'utf8'), iv)
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      apiToken = decrypted
      
      if (!apiToken) {
        throw new Error('Decrypted token is empty')
      }
    } catch (error) {
      console.error('❌ Token decryption failed:', error)
      return NextResponse.json({ 
        error: 'Invalid Canvas token - decryption failed', 
        valid: false,
        needsReauth: true,
        details: 'Token appears to be corrupted or was encrypted with a different key'
      }, { status: 400 })
    }

    // Test the token by making a simple API call
    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const testResponse = await fetch(`${canvas_url}/api/v1/users/self`, {
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!testResponse.ok) {
        const errorText = await testResponse.text().catch(() => 'Unknown error')
        console.error(`❌ Canvas API validation failed: ${testResponse.status} - ${errorText}`)
        
        if (testResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Canvas token is invalid or expired', 
            valid: false,
            needsReauth: true,
            details: 'The token was rejected by Canvas. Please re-authenticate.'
          }, { status: 400 })
        }

        return NextResponse.json({ 
          error: `Canvas API error: ${testResponse.status}`, 
          valid: false,
          canRetry: true,
          details: errorText
        }, { status: 400 })
      }

      const userData = await testResponse.json()
      console.log('✅ Canvas token validation successful')

      // Update last validation time
      await supabase
        .from('canvas_tokens')
        .update({ 
          last_validated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      // Copy cookies from supabase response
      const jsonResponse = NextResponse.json({
        valid: true,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email
        },
        canvas_url,
        lastSync: tokenData.last_sync,
        message: 'Canvas token is valid and working'
      }, { status: 200 })
      
      const cookies = response.headers.getSetCookie()
      cookies.forEach(cookie => {
        jsonResponse.headers.append('Set-Cookie', cookie)
      })
      
      return jsonResponse

    } catch (error: any) {
      console.error('❌ Canvas API test failed:', error)
      
      if (error.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Canvas API request timed out', 
          valid: false,
          canRetry: true,
          details: 'The request to Canvas took too long. Please check your internet connection and try again.'
        }, { status: 408 })
      }

      return NextResponse.json({ 
        error: 'Failed to validate Canvas token', 
        valid: false,
        canRetry: true,
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Token validation error:', error)
    return NextResponse.json({ 
      error: 'Failed to validate Canvas token',
      valid: false,
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { supabase } = createClient(request)
  
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', hasToken: false }, { status: 401 })
    }

    // Just check if token exists (quick check)
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('id, canvas_url, last_sync, last_validated')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ 
        hasToken: false,
        needsSetup: true
      }, { status: 200 })
    }

    return NextResponse.json({
      hasToken: true,
      canvas_url: tokenData.canvas_url,
      lastSync: tokenData.last_sync,
      lastValidated: tokenData.last_validated,
      needsValidation: !tokenData.last_validated || 
        (new Date().getTime() - new Date(tokenData.last_validated).getTime()) > 24 * 60 * 60 * 1000 // 24 hours
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error checking token status:', error)
    return NextResponse.json({ 
      error: 'Failed to check token status',
      hasToken: false
    }, { status: 500 })
  }
}
