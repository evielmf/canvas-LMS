import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, token } = await request.json()

    if (!canvasUrl || !token) {
      return NextResponse.json(
        { error: 'Canvas URL and token are required' },
        { status: 400 }
      )
    }

    // Normalize the URL
    const normalizedUrl = canvasUrl.replace(/\/+$/, '')

    // Test the Canvas API connection
    const response = await fetch(`${normalizedUrl}/api/v1/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Canvas API error:', response.status, response.statusText)
      return NextResponse.json(
        { 
          error: 'Invalid Canvas URL or token',
          details: `HTTP ${response.status}: ${response.statusText}`
        },
        { status: 400 }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Canvas connection successful',
      coursesCount: data.length
    })

  } catch (error) {
    console.error('Error testing Canvas connection:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test Canvas connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
