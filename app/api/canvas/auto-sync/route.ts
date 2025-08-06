import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'
import crypto from 'crypto'
import { 
  detectCourseConflicts, 
  detectAssignmentConflicts, 
  storeConflicts, 
  autoResolveConflicts,
  type ConflictDetectionResult 
} from '@/lib/sync-conflict-detector'

const ENCRYPTION_KEY = process.env.CANVAS_ENCRYPTION_KEY || 'your-32-character-secret-key-here'

const decryptToken = (encryptedToken: string) => {
  try {
    const textParts = encryptedToken.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = textParts.join(':')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Error decrypting token:', error)
    return null
  }
}

interface SyncStats {
  courses: number
  assignments: number
  submissions: number
  lastSync: string
  errors: string[]
  conflicts?: {
    total: number
    autoResolved: number
    requiresUserInput: number
  }
}

export async function POST(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  try {
    console.log('🔄 Starting automatic Canvas data sync...')
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Canvas token
    const { data: tokenData, error: tokenError } = await supabase
      .from('canvas_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      console.error('Canvas token not found:', tokenError)
      return NextResponse.json({ error: 'Canvas token not configured' }, { status: 400 })
    }

    const token = decryptToken(tokenData.encrypted_token)
    if (!token) {
      console.warn('🔧 Failed to decrypt Canvas token, likely due to encryption key change. Clearing invalid token...')
      
      // Clear the invalid token
      await supabase
        .from('canvas_tokens')
        .delete()
        .eq('user_id', user.id)
      
      return NextResponse.json({ 
        error: 'Canvas token invalid - please reconfigure your Canvas connection',
        code: 'TOKEN_INVALID'
      }, { status: 400 })
    }

    const baseUrl = tokenData.canvas_url.replace(/\/+$/, '') // Remove trailing slashes
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const stats: SyncStats = {
      courses: 0,
      assignments: 0,
      submissions: 0,
      lastSync: new Date().toISOString(),
      errors: []
    }

    // Step 1: Sync Courses
    console.log('📚 Syncing courses...')
    try {
      const coursesResponse = await fetch(
        `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=100&include[]=total_scores`,
        { headers }
      ).catch(error => {
        console.error('❌ Failed to fetch courses from Canvas:', error)
        throw new Error(`Network error fetching courses: ${error.message}`)
      })

      if (!coursesResponse.ok) {
        const errorText = await coursesResponse.text().catch(() => 'Unknown error')
        console.error(`❌ Canvas courses API error: ${coursesResponse.status} - ${errorText}`)
        throw new Error(`Canvas courses API returned ${coursesResponse.status}: ${errorText}`)
      }

      const courses = await coursesResponse.json()
      console.log(`Found ${courses.length} active courses`)

      // Get existing cached courses for conflict detection
      const { data: cachedCourses } = await supabase
        .from('canvas_courses_cache')
        .select('*')
        .eq('user_id', user.id)

      // Detect conflicts before clearing cache
      let courseConflicts: ConflictDetectionResult = { conflicts: [], autoResolvable: [], requiresUserInput: [] }
      if (cachedCourses && cachedCourses.length > 0) {
        console.log('🔍 Detecting course conflicts...')
        courseConflicts = detectCourseConflicts(cachedCourses, courses)
        
        if (courseConflicts.conflicts.length > 0) {
          console.log(`Found ${courseConflicts.conflicts.length} course conflicts`)
          console.log(`  - Auto-resolvable: ${courseConflicts.autoResolvable.length}`)
          console.log(`  - Requires user input: ${courseConflicts.requiresUserInput.length}`)
          
          // Store conflicts in database
          await storeConflicts(supabase, user.id, courseConflicts.requiresUserInput)
          
          // Auto-resolve safe conflicts
          const autoResolvedCount = await autoResolveConflicts(supabase, user.id, courseConflicts.autoResolvable)
          stats.conflicts = {
            total: courseConflicts.conflicts.length,
            autoResolved: autoResolvedCount,
            requiresUserInput: courseConflicts.requiresUserInput.length
          }
        }
      }

      // Clear existing courses for this user
      await supabase
        .from('canvas_courses_cache')
        .delete()
        .eq('user_id', user.id)

      // Insert courses
      if (courses.length > 0) {
        const coursesToInsert = courses.map((course: any) => ({
          user_id: user.id,
          canvas_course_id: course.id,
          name: course.name,
          course_code: course.course_code || '',
          enrollment_term_id: course.enrollment_term_id,
          workflow_state: course.workflow_state || 'available',
          start_at: course.start_at,
          end_at: course.end_at,
          course_color: course.course_color
        }))

        const { error: coursesInsertError } = await supabase
          .from('canvas_courses_cache')
          .insert(coursesToInsert)

        if (coursesInsertError) {
          console.error('Error inserting courses:', coursesInsertError)
          stats.errors.push(`Failed to cache courses: ${coursesInsertError.message}`)
        } else {
          stats.courses = courses.length
          console.log(`✅ Cached ${courses.length} courses`)
        }
      }

      // Step 2: Sync Assignments for each course
      console.log('📝 Syncing assignments...')
      
      // Get existing cached assignments for conflict detection
      const { data: cachedAssignments } = await supabase
        .from('canvas_assignments_cache')
        .select('*')
        .eq('user_id', user.id)

      // Collect all assignments for conflict detection
      let allLiveAssignments: any[] = []
      
      // Clear existing assignments for this user
      await supabase
        .from('canvas_assignments_cache')
        .delete()
        .eq('user_id', user.id)

      let totalAssignments = 0
      let totalSubmissions = 0

      for (const course of courses.slice(0, 10)) { // Limit to first 10 courses to avoid timeouts
        try {
          console.log(`  Fetching assignments for: ${course.name}`)
          
          const assignmentsResponse = await fetch(
            `${baseUrl}/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`,
            { headers }
          ).catch(error => {
            console.error(`❌ Network error fetching assignments for course ${course.id}:`, error)
            throw error
          })

          if (!assignmentsResponse.ok) {
            const errorText = await assignmentsResponse.text().catch(() => 'Unknown error')
            console.warn(`❌ Failed to fetch assignments for course ${course.id}: ${assignmentsResponse.status} - ${errorText}`)
            continue
          }

          const assignments = await assignmentsResponse.json()
          console.log(`    Found ${assignments.length} assignments`)

          // Add to all live assignments for conflict detection
          allLiveAssignments.push(...assignments)

          if (assignments.length > 0) {
            const assignmentsToInsert = assignments.map((assignment: any) => ({
              user_id: user.id,
              canvas_assignment_id: assignment.id,
              course_id: course.id,
              name: assignment.name,
              description: assignment.description || '',
              due_at: assignment.due_at,
              points_possible: assignment.points_possible || 0,
              submission_types: assignment.submission_types || [],
              html_url: assignment.html_url,
              has_submission: !!assignment.submission,
              score: assignment.submission?.score || null,
              submitted_at: assignment.submission?.submitted_at || null,
              workflow_state: assignment.submission?.workflow_state || assignment.workflow_state || 'published',
              assignment_group_id: assignment.assignment_group_id,
              created_at_canvas: assignment.created_at,
              updated_at_canvas: assignment.updated_at
            }))

            const { error: assignmentsInsertError } = await supabase
              .from('canvas_assignments_cache')
              .insert(assignmentsToInsert)

            if (assignmentsInsertError) {
              console.error(`Error inserting assignments for course ${course.id}:`, assignmentsInsertError)
              stats.errors.push(`Failed to cache assignments for ${course.name}: ${assignmentsInsertError.message}`)
            } else {
              totalAssignments += assignments.length
              totalSubmissions += assignments.filter((a: any) => a.submission).length
              console.log(`    ✅ Cached ${assignments.length} assignments`)
            }
          }
        } catch (error) {
          console.error(`Error processing course ${course.id}:`, error)
          stats.errors.push(`Failed to process course ${course.name}: ${error}`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Detect assignment conflicts after collecting all data
      if (cachedAssignments && cachedAssignments.length > 0 && allLiveAssignments.length > 0) {
        console.log('🔍 Detecting assignment conflicts...')
        const assignmentConflicts = detectAssignmentConflicts(cachedAssignments, allLiveAssignments)
        
        if (assignmentConflicts.conflicts.length > 0) {
          console.log(`Found ${assignmentConflicts.conflicts.length} assignment conflicts`)
          console.log(`  - Auto-resolvable: ${assignmentConflicts.autoResolvable.length}`)
          console.log(`  - Requires user input: ${assignmentConflicts.requiresUserInput.length}`)
          
          // Store conflicts in database
          await storeConflicts(supabase, user.id, assignmentConflicts.requiresUserInput)
          
          // Auto-resolve safe conflicts
          const autoResolvedCount = await autoResolveConflicts(supabase, user.id, assignmentConflicts.autoResolvable)
          
          // Update stats with combined conflict data
          if (stats.conflicts) {
            stats.conflicts.total += assignmentConflicts.conflicts.length
            stats.conflicts.autoResolved += autoResolvedCount
            stats.conflicts.requiresUserInput += assignmentConflicts.requiresUserInput.length
          } else {
            stats.conflicts = {
              total: assignmentConflicts.conflicts.length,
              autoResolved: autoResolvedCount,
              requiresUserInput: assignmentConflicts.requiresUserInput.length
            }
          }
        }
      }

      stats.assignments = totalAssignments
      stats.submissions = totalSubmissions

      // Update last sync time (if the column exists)
      try {
        await supabase
          .from('canvas_tokens')
          .update({ 
            last_sync: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', user.id)
      } catch (error) {
        console.warn('Could not update last sync time:', error)
      }

      console.log(`🎉 Sync completed successfully!`)
      console.log(`  📚 Courses: ${stats.courses}`)
      console.log(`  📝 Assignments: ${stats.assignments}`)
      console.log(`  ✅ Submissions: ${stats.submissions}`)
      
      if (stats.conflicts) {
        console.log(`  🔍 Conflicts detected: ${stats.conflicts.total}`)
        console.log(`    - Auto-resolved: ${stats.conflicts.autoResolved}`)
        console.log(`    - Requires attention: ${stats.conflicts.requiresUserInput}`)
      }
      
      if (stats.errors.length > 0) {
        console.log(`  ⚠️ Errors: ${stats.errors.length}`)
      }

      // Return response with cookies preserved
      const jsonResponse = NextResponse.json({ 
        success: true,
        stats,
        message: 'Canvas data synchronized successfully'
      }, { status: 200 })
      
      // Copy cookies from supabase response
      const cookies = response.headers.getSetCookie()
      cookies.forEach(cookie => {
        jsonResponse.headers.append('Set-Cookie', cookie)
      })
      
      return jsonResponse

    } catch (error: any) {
      console.error('Error during courses sync:', error)
      stats.errors.push(`Course sync failed: ${error.message}`)
      
      return NextResponse.json({ 
        success: false,
        stats,
        error: 'Failed to sync Canvas data',
        details: error.message 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Auto-sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during sync',
      details: error.message 
    }, { status: 500 })
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  const { supabase } = createClient(request)
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sync status
    const { data: tokenData } = await supabase
      .from('canvas_tokens')
      .select('last_sync, canvas_url')
      .eq('user_id', user.id)
      .single()

    // Get cache statistics
    const [coursesCount, assignmentsCount] = await Promise.all([
      supabase
        .from('canvas_courses_cache')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('canvas_assignments_cache')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ])

    return NextResponse.json({
      lastSync: tokenData?.last_sync || null,
      canvasUrl: tokenData?.canvas_url || null,
      cached: {
        courses: coursesCount.count || 0,
        assignments: assignmentsCount.count || 0
      },
      needsSync: !tokenData?.last_sync || 
        (new Date().getTime() - new Date(tokenData.last_sync).getTime()) > 24 * 60 * 60 * 1000 // 24 hours
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to get sync status',
      details: error.message 
    }, { status: 500 })
  }
}
