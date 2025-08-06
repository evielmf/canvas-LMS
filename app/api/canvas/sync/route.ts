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
    console.log('Starting Canvas data sync...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Canvas token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('canvas_url, encrypted_token')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      console.error('Canvas token not found:', tokenError)
      return NextResponse.json({ error: 'Canvas token not configured' }, { status: 400 })
    }

    const { canvas_url, encrypted_token } = tokenData
    
    // Decrypt token (using standardized encryption method)
    const crypto = require('crypto')
    const encryptionKey = process.env.CANVAS_ENCRYPTION_KEY || 'your-32-character-secret-key-here'
    let apiToken: string
    
    try {
      // Parse encrypted data
      const textParts = encrypted_token.split(':')
      const iv = Buffer.from(textParts.shift()!, 'hex')
      const encryptedText = textParts.join(':')
      
      // Create decipher using standardized method
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey.slice(0, 32), 'utf8'), iv)
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      apiToken = decrypted
      
      if (!apiToken) {
        throw new Error('Failed to decrypt token')
      }
    } catch (error) {
      console.error('Token decryption failed:', error)
      return NextResponse.json({ error: 'Invalid Canvas token' }, { status: 400 })
    }

    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }

    // Fetch and cache courses
    console.log('Fetching courses...')
    const coursesController = new AbortController()
    const coursesTimeoutId = setTimeout(() => coursesController.abort(), 30000)
    
    const coursesResponse = await fetch(`${canvas_url}/api/v1/courses?enrollment_state=active&per_page=100`, {
      headers,
      signal: coursesController.signal
    })
    
    clearTimeout(coursesTimeoutId)

    if (!coursesResponse.ok) {
      throw new Error(`Failed to fetch courses: ${coursesResponse.status}`)
    }

    const courses = await coursesResponse.json()
    console.log(`Fetched ${courses.length} courses`)

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

    // Clear old course cache
    await supabase
      .from('canvas_courses_cache')
      .delete()
      .eq('user_id', user.id)

    // Insert new courses
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
        .insert(coursesToInsert)

      if (coursesInsertError) {
        console.error('Error inserting courses:', coursesInsertError)
        console.error('Courses data sample:', coursesToInsert[0])
        return NextResponse.json({ error: 'Failed to cache courses', details: coursesInsertError }, { status: 500 })
      } else {
        console.log(`✅ Successfully inserted ${coursesToInsert.length} courses`)
      }
    }

    // Fetch assignments for all courses
    console.log('Fetching assignments...')
    let allAssignments: any[] = []
    
    for (const course of courses) {
      try {
        const assignmentsController = new AbortController()
        const assignmentsTimeoutId = setTimeout(() => assignmentsController.abort(), 30000)
        
        const assignmentsResponse = await fetch(
          `${canvas_url}/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`,
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
          
          allAssignments = allAssignments.concat(enrichedAssignments)
          console.log(`Fetched ${assignments.length} assignments for ${course.name}`)
        }
      } catch (error) {
        console.error(`Error fetching assignments for course ${course.id}:`, error)
      }
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

    // Clear old assignment cache
    await supabase
      .from('canvas_assignments_cache')
      .delete()
      .eq('user_id', user.id)

    // Insert new assignments
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
        .insert(assignmentsToInsert)

      if (assignmentsInsertError) {
        console.error('Error inserting assignments:', assignmentsInsertError)
        console.error('Assignments data sample:', assignmentsToInsert[0])
        return NextResponse.json({ error: 'Failed to cache assignments', details: assignmentsInsertError }, { status: 500 })
      } else {
        console.log(`✅ Successfully inserted ${assignmentsToInsert.length} assignments`)
      }
    }

    // Update last sync time
    await supabase
      .from('canvas_tokens')
      .update({ 
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    console.log('Canvas data sync completed successfully')
    
    // Calculate conflict summary
    const totalConflicts = (courseConflictResult?.conflicts?.length || 0) + (assignmentConflictResult?.conflicts?.length || 0)
    const totalAutoResolved = (courseConflictResult?.autoResolvable?.length || 0) + (assignmentConflictResult?.autoResolvable?.length || 0)
    const totalUserInputRequired = (courseConflictResult?.requiresUserInput?.length || 0) + (assignmentConflictResult?.requiresUserInput?.length || 0)
    
    return NextResponse.json({
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
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Canvas sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync Canvas data',
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
