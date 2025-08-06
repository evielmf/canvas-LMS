/**
 * Smart Sync Conflict Resolver - Conflict Detection Utility
 * Detects inconsistencies between cached data and live Canvas API data
 */

export interface ConflictData {
  itemType: 'assignment' | 'course' | 'grade'
  itemId: string
  field: string
  cachedValue: any
  liveValue: any
}

export interface ConflictDetectionResult {
  conflicts: ConflictData[]
  autoResolvable: ConflictData[]
  requiresUserInput: ConflictData[]
}

/**
 * Fields that are safe to auto-resolve (usually cosmetic changes)
 */
const AUTO_RESOLVABLE_FIELDS = [
  'updated_at_canvas',
  'created_at_canvas',
  'synced_at',
  'workflow_state' // In most cases
]

/**
 * Fields that require user attention (data integrity impact)
 */
const CRITICAL_FIELDS = [
  'name',
  'due_at', 
  'points_possible',
  'description',
  'score',
  'submitted_at'
]

/**
 * Compare two objects and detect differences
 */
function detectObjectDifferences(
  cached: any,
  live: any,
  itemType: string,
  itemId: string
): ConflictData[] {
  const conflicts: ConflictData[] = []
  
  if (!cached || !live) {
    return conflicts
  }

  // Get all possible fields from both objects
  const allFields = new Set([...Object.keys(cached), ...Object.keys(live)])
  
  for (const field of Array.from(allFields)) {
    const cachedValue = cached[field]
    const liveValue = live[field]
    
    // Skip if values are the same
    if (JSON.stringify(cachedValue) === JSON.stringify(liveValue)) {
      continue
    }
    
    // Skip null/undefined comparisons for non-critical fields
    if ((cachedValue == null && liveValue == null)) {
      continue
    }
    
    // Detect meaningful differences
    if (cachedValue !== liveValue) {
      conflicts.push({
        itemType: itemType as any,
        itemId,
        field,
        cachedValue,
        liveValue
      })
    }
  }
  
  return conflicts
}

/**
 * Detect conflicts in course data
 */
export function detectCourseConflicts(
  cachedCourses: any[],
  liveCourses: any[]
): ConflictDetectionResult {
  const conflicts: ConflictData[] = []
  
  // Create lookup maps
  const cachedMap = new Map(cachedCourses.map(c => [c.canvas_course_id?.toString(), c]))
  const liveMap = new Map(liveCourses.map(c => [c.id?.toString(), c]))
  
  // Check for changes in existing courses
  for (const [courseId, cachedCourse] of Array.from(cachedMap.entries())) {
    const liveCourse = liveMap.get(courseId)
    
    if (liveCourse) {
      // Map live course to our cache format for comparison
      const mappedLiveCourse = {
        canvas_course_id: liveCourse.id,
        name: liveCourse.name,
        course_code: liveCourse.course_code,
        enrollment_term_id: liveCourse.enrollment_term_id,
        workflow_state: liveCourse.workflow_state,
        start_at: liveCourse.start_at,
        end_at: liveCourse.end_at,
        course_color: liveCourse.course_color
      }
      
      const courseConflicts = detectObjectDifferences(
        cachedCourse,
        mappedLiveCourse,
        'course',
        courseId
      )
      
      conflicts.push(...courseConflicts)
    } else {
      // Course deleted from Canvas but still in cache
      conflicts.push({
        itemType: 'course',
        itemId: courseId,
        field: 'existence',
        cachedValue: 'exists',
        liveValue: 'deleted'
      })
    }
  }
  
  // Check for new courses in Canvas not in cache
  for (const [courseId, liveCourse] of Array.from(liveMap.entries())) {
    if (!cachedMap.has(courseId)) {
      conflicts.push({
        itemType: 'course',
        itemId: courseId,
        field: 'existence',
        cachedValue: 'missing',
        liveValue: 'exists'
      })
    }
  }
  
  return categorizeConflicts(conflicts)
}

/**
 * Detect conflicts in assignment data
 */
export function detectAssignmentConflicts(
  cachedAssignments: any[],
  liveAssignments: any[]
): ConflictDetectionResult {
  const conflicts: ConflictData[] = []
  
  // Create lookup maps
  const cachedMap = new Map(cachedAssignments.map(a => [a.canvas_assignment_id?.toString(), a]))
  const liveMap = new Map(liveAssignments.map(a => [a.id?.toString(), a]))
  
  // Check for changes in existing assignments
  for (const [assignmentId, cachedAssignment] of Array.from(cachedMap.entries())) {
    const liveAssignment = liveMap.get(assignmentId)
    
    if (liveAssignment) {
      // Map live assignment to our cache format for comparison
      const mappedLiveAssignment = {
        canvas_assignment_id: liveAssignment.id,
        course_id: liveAssignment.course_id,
        name: liveAssignment.name,
        description: liveAssignment.description,
        due_at: liveAssignment.due_at,
        points_possible: liveAssignment.points_possible,
        submission_types: liveAssignment.submission_types,
        html_url: liveAssignment.html_url,
        has_submission: !!liveAssignment.submission,
        score: liveAssignment.submission?.score,
        submitted_at: liveAssignment.submission?.submitted_at,
        workflow_state: liveAssignment.submission?.workflow_state || liveAssignment.workflow_state,
        assignment_group_id: liveAssignment.assignment_group_id,
        created_at_canvas: liveAssignment.created_at,
        updated_at_canvas: liveAssignment.updated_at
      }
      
      const assignmentConflicts = detectObjectDifferences(
        cachedAssignment,
        mappedLiveAssignment,
        'assignment',
        assignmentId
      )
      
      conflicts.push(...assignmentConflicts)
    } else {
      // Assignment deleted from Canvas but still in cache
      conflicts.push({
        itemType: 'assignment',
        itemId: assignmentId,
        field: 'existence',
        cachedValue: 'exists',
        liveValue: 'deleted'
      })
    }
  }
  
  // Check for new assignments in Canvas not in cache
  for (const [assignmentId, liveAssignment] of Array.from(liveMap.entries())) {
    if (!cachedMap.has(assignmentId)) {
      conflicts.push({
        itemType: 'assignment',
        itemId: assignmentId,
        field: 'existence',
        cachedValue: 'missing',
        liveValue: 'exists'
      })
    }
  }
  
  return categorizeConflicts(conflicts)
}

/**
 * Categorize conflicts into auto-resolvable vs requiring user input
 */
function categorizeConflicts(conflicts: ConflictData[]): ConflictDetectionResult {
  const autoResolvable: ConflictData[] = []
  const requiresUserInput: ConflictData[] = []
  
  for (const conflict of conflicts) {
    if (AUTO_RESOLVABLE_FIELDS.includes(conflict.field)) {
      autoResolvable.push(conflict)
    } else if (CRITICAL_FIELDS.includes(conflict.field) || conflict.field === 'existence') {
      requiresUserInput.push(conflict)
    } else {
      // Default to requiring user input for unknown fields
      requiresUserInput.push(conflict)
    }
  }
  
  return {
    conflicts,
    autoResolvable,
    requiresUserInput
  }
}

/**
 * Store conflicts in the database
 */
export async function storeConflicts(
  supabase: any,
  userId: string,
  conflicts: ConflictData[]
): Promise<void> {
  if (conflicts.length === 0) {
    return
  }
  
  console.log(`🔍 Processing ${conflicts.length} sync conflicts...`)
  
  let storedCount = 0
  let updatedCount = 0
  
  // Process conflicts in batches to avoid overwhelming the database
  const batchSize = 10
  for (let i = 0; i < conflicts.length; i += batchSize) {
    const batch = conflicts.slice(i, i + batchSize)
    
    for (const conflict of batch) {
      try {
        const conflictRecord = {
          user_id: userId,
          item_type: conflict.itemType,
          item_id: conflict.itemId,
          field: conflict.field,
          cached_value: conflict.cachedValue,
          live_value: conflict.liveValue,
          status: 'unresolved'
        }
        
        // First try to insert the conflict
        const { error: insertError } = await supabase
          .from('sync_conflicts')
          .insert(conflictRecord)
        
        if (!insertError) {
          storedCount++
        } else if (insertError.code === '23505') {
          // Duplicate key error - update existing conflict
          const { error: updateError } = await supabase
            .from('sync_conflicts')
            .update({
              cached_value: conflict.cachedValue,
              live_value: conflict.liveValue,
              detected_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('item_type', conflict.itemType)
            .eq('item_id', conflict.itemId)
            .eq('field', conflict.field)
            .eq('status', 'unresolved')
          
          if (!updateError) {
            updatedCount++
          } else {
            console.error('Error updating conflict:', updateError)
          }
        } else {
          console.error('Error inserting conflict:', insertError)
        }
      } catch (error) {
        console.error('Error processing conflict:', error)
      }
    }
  }
  
  console.log(`🔍 Stored ${storedCount} new conflicts, updated ${updatedCount} existing conflicts`)
}

/**
 * Auto-resolve safe conflicts
 */
export async function autoResolveConflicts(
  supabase: any,
  userId: string,
  conflicts: ConflictData[]
): Promise<number> {
  if (conflicts.length === 0) {
    return 0
  }
  
  console.log(`🔧 Auto-resolving ${conflicts.length} safe conflicts...`)
  
  let resolvedCount = 0
  
  // Process each conflict individually to handle properly
  for (const conflict of conflicts) {
    try {
      const { error } = await supabase
        .from('sync_conflicts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: 'auto'
        })
        .eq('user_id', userId)
        .eq('item_type', conflict.itemType)
        .eq('item_id', conflict.itemId)
        .eq('field', conflict.field)
        .eq('status', 'unresolved')
      
      if (!error) {
        resolvedCount++
      } else {
        console.error(`Failed to auto-resolve conflict ${conflict.itemType}:${conflict.itemId}:${conflict.field}:`, error)
      }
    } catch (error) {
      console.error(`Error auto-resolving conflict:`, error)
    }
  }
  
  console.log(`✅ Auto-resolved ${resolvedCount} conflicts`)
  return resolvedCount
}
