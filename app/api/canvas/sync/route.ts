import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'
import { 
  detectCourseConflicts, 
  detectAssignmentConflicts, 
  storeConflicts, 
  autoResolveConflicts 
} from '@/lib/sync-conflict-detector'

export async function POST(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.log('🔄 Starting Canvas data sync...')
    
    // Get user from session with retry logic
    let user, userError
    let retryCount = 0
    const maxRetries = 3
    
    do {
      const result = await supabase.auth.getUser()
      user = result.data?.user
      userError = result.error
      
      if (userError || !user) {
        retryCount++
        console.warn(`⚠️ User authentication attempt ${retryCount} failed:`, userError)
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        }
      }
    } while ((userError || !user) && retryCount < maxRetries)
    
    if (userError || !user) {
      console.error('❌ User authentication failed after retries:', userError)
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: 'Unable to verify user session. Please log in again.',
        needsReauth: true
      }, { status: 401 })
    }

    console.log(`👤 Authenticated user: ${user.id}`)

    // Get Canvas token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('canvas_url, encrypted_token, last_sync')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      console.error('❌ Canvas token not found:', tokenError)
      return NextResponse.json({ 
        error: 'Canvas token not configured',
        needsSetup: true,
        details: 'Please set up your Canvas integration first.'
      }, { status: 400 })
    }

    const { canvas_url, encrypted_token } = tokenData
    
    // Decrypt token with enhanced error handling
    const crypto = require('crypto')
    const encryptionKey = process.env.CANVAS_ENCRYPTION_KEY || 'your-32-character-secret-key-here'
    let apiToken: string
    
    try {
      console.log('🔐 Decrypting Canvas token...')
      
      if (!encrypted_token || typeof encrypted_token !== 'string') {
        throw new Error('Invalid encrypted token format')
      }
      
      // Parse encrypted data
      const textParts = encrypted_token.split(':')
      if (textParts.length < 2) {
        throw new Error('Malformed encrypted token - missing components')
      }
      
      const iv = Buffer.from(textParts.shift()!, 'hex')
      const encryptedText = textParts.join(':')
      
      if (iv.length !== 16) {
        throw new Error('Invalid initialization vector length')
      }
      
      // Create decipher using standardized method
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey.slice(0, 32), 'utf8'), iv)
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      apiToken = decrypted
      
      if (!apiToken || apiToken.trim().length === 0) {
        throw new Error('Decrypted token is empty')
      }
      
      console.log('✅ Token decrypted successfully')
      
    } catch (error: any) {
      console.error('❌ Token decryption failed:', error)
      return NextResponse.json({ 
        error: 'Invalid Canvas token',
        details: 'Your Canvas token appears to be corrupted. Please re-authenticate with Canvas.',
        needsReauth: true,
        techDetails: error.message
      }, { status: 400 })
    }

    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Easeboard/1.0 Canvas Integration'
    }

    // Test token validity first
    console.log('🔍 Testing Canvas token validity...')
    try {
      const testController = new AbortController()
      const testTimeoutId = setTimeout(() => testController.abort(), 10000)
      
      const testResponse = await fetch(`${canvas_url}/api/v1/users/self`, {
        headers,
        signal: testController.signal
      })
      
      clearTimeout(testTimeoutId)
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text().catch(() => 'Unknown error')
        console.error(`❌ Canvas token validation failed: ${testResponse.status} - ${errorText}`)
        
        if (testResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Canvas token is invalid or expired',
            details: 'Your Canvas token has expired or been revoked. Please re-authenticate.',
            needsReauth: true
          }, { status: 401 })
        }
        
        throw new Error(`Canvas API error: ${testResponse.status} - ${errorText}`)
      }
      
      console.log('✅ Canvas token is valid')
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Canvas token validation timed out')
        return NextResponse.json({ 
          error: 'Canvas connection timeout',
          details: 'Unable to connect to Canvas. Please check your internet connection and try again.',
          canRetry: true
        }, { status: 408 })
      }
      throw error
    }

    // Fetch and cache courses with enhanced error handling
    console.log('📚 Fetching courses from Canvas...')
    const coursesController = new AbortController()
    const coursesTimeoutId = setTimeout(() => coursesController.abort(), 45000) // Increased timeout
    
    let courses = []
    try {
      const coursesResponse = await fetch(`${canvas_url}/api/v1/courses?enrollment_state=active&per_page=100&include[]=total_students&include[]=term`, {
        headers,
        signal: coursesController.signal
      })
      
      clearTimeout(coursesTimeoutId)

      if (!coursesResponse.ok) {
        const errorText = await coursesResponse.text().catch(() => 'Unknown error')
        console.error(`❌ Canvas courses API error: ${coursesResponse.status} - ${errorText}`)
        
        if (coursesResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Canvas authentication failed',
            details: 'Your Canvas token has expired. Please re-authenticate.',
            needsReauth: true
          }, { status: 401 })
        }
        
        if (coursesResponse.status >= 500) {
          return NextResponse.json({ 
            error: 'Canvas server error',
            details: 'Canvas is experiencing issues. Please try again later.',
            canRetry: true
          }, { status: 502 })
        }
        
        throw new Error(`Failed to fetch courses: ${coursesResponse.status} - ${errorText}`)
      }

      courses = await coursesResponse.json()
      console.log(`✅ Fetched ${courses.length} courses`)
      
    } catch (error: any) {
      clearTimeout(coursesTimeoutId)
      
      if (error.name === 'AbortError') {
        console.error('❌ Courses fetch timed out after 45 seconds')
        return NextResponse.json({ 
          error: 'Canvas request timeout',
          details: 'The request to fetch courses took too long. Canvas might be slow. Please try again.',
          canRetry: true
        }, { status: 408 })
      }
      
      console.error('❌ Network error fetching courses:', error)
      return NextResponse.json({ 
        error: 'Network error fetching courses',
        details: error.message,
        canRetry: true
      }, { status: 500 })
    }

    // **CONFLICT DETECTION: Compare cached courses with live data**
    console.log('🔍 Detecting course conflicts...')
    const { data: cachedCourses } = await supabase
      .from('canvas_courses_cache')
      .select('*')
      .eq('user_id', user.id)

    const courseConflictResult = detectCourseConflicts(cachedCourses || [], courses)
    
    if (courseConflictResult.conflicts.length > 0) {
      console.log(`📊 Found ${courseConflictResult.conflicts.length} course conflicts`)
      await storeConflicts(supabase, user.id, courseConflictResult.requiresUserInput)
      
      // Auto-resolve safe conflicts
      if (courseConflictResult.autoResolvable.length > 0) {
        const autoResolvedCount = await autoResolveConflicts(
          supabase, 
          user.id, 
          courseConflictResult.autoResolvable
        )
        console.log(`⚡ Auto-resolved ${autoResolvedCount} course conflicts`)
      }
    }

    // Insert or update courses using upsert
    if (courses.length > 0) {
      const coursesToInsert = courses.map((course: any) => ({
        user_id: user.id,
        canvas_course_id: course.id,
        name: course.name,
        course_code: course.course_code || '',
        start_at: course.start_at,
        end_at: course.end_at,
        workflow_state: course.workflow_state || 'active',
        enrollment_term_id: course.enrollment_term_id
      }))

      const { error: coursesInsertError } = await supabase
        .from('canvas_courses_cache')
        .upsert(coursesToInsert, {
          onConflict: 'user_id,canvas_course_id'
        })

      if (coursesInsertError) {
        console.error('Error inserting courses:', coursesInsertError)
        console.error('Courses data sample:', coursesToInsert[0])
        return NextResponse.json({ error: 'Failed to cache courses', details: coursesInsertError }, { status: 500 })
      } else {
        console.log(`✅ Successfully inserted ${coursesToInsert.length} courses`)
      }
    }

    // Fetch assignments for all courses with better error handling
    console.log('📝 Fetching assignments from Canvas...')
    let allAssignments: any[] = []
    const failedCourses: string[] = []
    
    // Process courses in batches to avoid overwhelming the API
    const batchSize = 5
    const courseBatches = []
    for (let i = 0; i < courses.length; i += batchSize) {
      courseBatches.push(courses.slice(i, i + batchSize))
    }
    
    for (let batchIndex = 0; batchIndex < courseBatches.length; batchIndex++) {
      const batch = courseBatches[batchIndex]
      console.log(`📦 Processing batch ${batchIndex + 1}/${courseBatches.length} (${batch.length} courses)`)
      
      const batchPromises = batch.map(async (course: any) => {
        try {
          const assignmentsController = new AbortController()
          const assignmentsTimeoutId = setTimeout(() => assignmentsController.abort(), 30000)
          
          const assignmentsResponse = await fetch(
            `${canvas_url}/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission&order_by=due_at`,
            { headers, signal: assignmentsController.signal }
          )
          
          clearTimeout(assignmentsTimeoutId)

          if (assignmentsResponse.ok) {
            const assignments = await assignmentsResponse.json()
            
            // Add course info to each assignment
            const enrichedAssignments = assignments.map((assignment: any) => ({
              ...assignment,
              course_name: course.name,
              course_code: course.course_code || '',
              course
            }))
            
            console.log(`✅ Fetched ${assignments.length} assignments for "${course.name}"`)
            return enrichedAssignments
          } else if (assignmentsResponse.status === 401) {
            throw new Error('Authentication failed')
          } else {
            console.warn(`⚠️ Failed to fetch assignments for course ${course.id}: ${assignmentsResponse.status}`)
            failedCourses.push(course.name)
            return []
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.error(`❌ Assignments fetch for course "${course.name}" timed out`)
            failedCourses.push(course.name)
            return []
          }
          
          if (error.message === 'Authentication failed') {
            throw error // Re-throw auth errors
          }
          
          console.error(`❌ Error fetching assignments for course "${course.name}":`, error.message)
          failedCourses.push(course.name)
          return []
        }
      })
      
      try {
        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(assignments => {
          allAssignments = allAssignments.concat(assignments)
        })
        
        // Small delay between batches to be nice to Canvas
        if (batchIndex < courseBatches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error: any) {
        if (error.message === 'Authentication failed') {
          return NextResponse.json({ 
            error: 'Canvas authentication failed during sync',
            details: 'Your Canvas token expired during the sync process. Please re-authenticate.',
            needsReauth: true
          }, { status: 401 })
        }
        throw error
      }
    }
    
    console.log(`📊 Assignment fetch complete: ${allAssignments.length} total assignments`)
    if (failedCourses.length > 0) {
      console.warn(`⚠️ Failed to fetch assignments for ${failedCourses.length} courses: ${failedCourses.join(', ')}`)
    }

    // **CONFLICT DETECTION: Compare cached assignments with live data**
    console.log('🔍 Detecting assignment conflicts...')
    const { data: cachedAssignments } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)

    const assignmentConflictResult = detectAssignmentConflicts(cachedAssignments || [], allAssignments)
    
    if (assignmentConflictResult.conflicts.length > 0) {
      console.log(`📊 Found ${assignmentConflictResult.conflicts.length} assignment conflicts`)
      await storeConflicts(supabase, user.id, assignmentConflictResult.requiresUserInput)
      
      // Auto-resolve safe conflicts
      if (assignmentConflictResult.autoResolvable.length > 0) {
        const autoResolvedCount = await autoResolveConflicts(
          supabase, 
          user.id, 
          assignmentConflictResult.autoResolvable
        )
        console.log(`⚡ Auto-resolved ${autoResolvedCount} assignment conflicts`)
      }
    }

    // Insert or update assignments using upsert
    if (allAssignments.length > 0) {
      const assignmentsToInsert = allAssignments.map((assignment: any) => ({
        user_id: user.id,
        canvas_assignment_id: assignment.id,
        course_id: assignment.course_id,
        name: assignment.name,
        description: assignment.description || '',
        due_at: assignment.due_at,
        points_possible: assignment.points_possible || 0,
        submission_types: assignment.submission_types || [],
        html_url: assignment.html_url || '',
        has_submission: !!assignment.submission,
        score: assignment.submission?.score || null,
        submitted_at: assignment.submission?.submitted_at || null,
        workflow_state: assignment.submission?.workflow_state || 'unsubmitted',
        assignment_group_id: assignment.assignment_group_id,
        created_at_canvas: assignment.created_at,
        updated_at_canvas: assignment.updated_at
      }))

      const { error: assignmentsInsertError } = await supabase
        .from('canvas_assignments_cache')
        .upsert(assignmentsToInsert, {
          onConflict: 'user_id,canvas_assignment_id'
        })

      if (assignmentsInsertError) {
        console.error('Error inserting assignments:', assignmentsInsertError)
        console.error('Assignments data sample:', assignmentsToInsert[0])
        return NextResponse.json({ error: 'Failed to cache assignments', details: assignmentsInsertError }, { status: 500 })
      } else {
        console.log(`✅ Successfully inserted ${assignmentsToInsert.length} assignments`)
      }
    }

    // Update last sync time with validation timestamp
    await supabase
      .from('canvas_tokens')
      .update({ 
        last_sync: new Date().toISOString(),
        last_validated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    console.log('✅ Canvas data sync completed successfully')
    
    // Calculate conflict summary
    const totalConflicts = (courseConflictResult?.conflicts?.length || 0) + (assignmentConflictResult?.conflicts?.length || 0)
    const totalAutoResolved = (courseConflictResult?.autoResolvable?.length || 0) + (assignmentConflictResult?.autoResolvable?.length || 0)
    const totalUserInputRequired = (courseConflictResult?.requiresUserInput?.length || 0) + (assignmentConflictResult?.requiresUserInput?.length || 0)
    
    // Prepare success response
    const syncResult = {
      success: true,
      data: {
        courses: courses.length,
        assignments: allAssignments.length,
        syncTime: new Date().toISOString()
      },
      conflicts: {
        total: totalConflicts,
        autoResolved: totalAutoResolved,
        requiresUserInput: totalUserInputRequired,
        hasConflicts: totalConflicts > 0
      },
      warnings: failedCourses.length > 0 ? {
        failedCourses: failedCourses.length,
        courseNames: failedCourses.slice(0, 5), // Show first 5 failed courses
        message: failedCourses.length > 5 
          ? `Some assignments couldn't be fetched from ${failedCourses.length} courses` 
          : `Assignments couldn't be fetched from: ${failedCourses.join(', ')}`
      } : undefined
    }
    
    // Copy cookies from supabase response
    const jsonResponse = NextResponse.json(syncResult, { status: 200 })
    const cookies = response.headers.getSetCookie()
    cookies.forEach(cookie => {
      jsonResponse.headers.append('Set-Cookie', cookie)
    })
    
    return jsonResponse

  } catch (error: any) {
    console.error('❌ Canvas sync error:', error)
    
    // Provide detailed error information
    const errorResponse = {
      success: false,
      error: 'Failed to sync Canvas data',
      details: error.message,
      canRetry: true,
      needsReauth: false
    }
    
    // Check for specific error types
    if (error.message?.includes('token') || error.message?.includes('401')) {
      errorResponse.needsReauth = true
      errorResponse.canRetry = false
    }
    
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      errorResponse.details = 'Connection issues detected. Please check your internet connection and try again.'
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { supabase } = createClient(request)
  
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get last sync time
    const { data: tokenData } = await supabase
      .from('canvas_tokens')
      .select('last_sync')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      lastSync: tokenData?.last_sync || null,
      shouldSync: !tokenData?.last_sync || 
        (new Date().getTime() - new Date(tokenData.last_sync).getTime()) > 15 * 60 * 1000 // 15 minutes
    })

  } catch (error: any) {
    console.error('Error checking sync status:', error)
    return NextResponse.json({ error: 'Failed to check sync status' }, { status: 500 })
  }
}
