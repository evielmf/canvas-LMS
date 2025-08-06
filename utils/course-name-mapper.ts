'use client'

export interface CourseNameMapping {
  id: string
  user_id: string
  course_id: string
  original_name?: string
  mapped_name: string
  created_at: string
  updated_at: string
}

/**
 * Utility class for handling course name mappings
 * Provides fallback mechanisms for unknown course names
 */
export class CourseNameMapper {
  private mappings: Map<string, string> = new Map()

  constructor(mappings: CourseNameMapping[] = []) {
    this.setMappings(mappings)
  }

  /**
   * Set the course name mappings
   */
  setMappings(mappings: CourseNameMapping[]) {
    this.mappings.clear()
    mappings.forEach(mapping => {
      this.mappings.set(mapping.course_id, mapping.mapped_name)
    })
  }

  /**
   * Get the mapped course name or return the original with fallback
   */
  getCourseName(courseId: string, originalName?: string): string {
    // First check if we have a user-defined mapping
    const mappedName = this.mappings.get(courseId)
    if (mappedName) {
      return mappedName
    }

    // If no mapping exists, use the original name or fallback
    return originalName || this.generateFallbackName(courseId)
  }

  /**
   * Check if a course name is "unknown" and needs mapping
   */
  isUnknownCourse(courseName?: string): boolean {
    if (!courseName) return true
    
    const unknownVariants = [
      'unknown course',
      'unknown',
      'n/a',
      'null',
      'undefined',
      ''
    ]
    
    return unknownVariants.includes(courseName.toLowerCase().trim())
  }

  /**
   * Generate a fallback name for unknown courses
   */
  private generateFallbackName(courseId: string): string {
    // Try to extract meaningful information from course ID
    if (courseId && courseId.length > 0) {
      // If course ID looks like a number, format it nicely
      if (/^\d+$/.test(courseId)) {
        return `Course ${courseId}`
      }
      
      // If course ID has letters, try to make it more readable
      const formatted = courseId
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      return formatted
    }
    
    return 'Unknown Course'
  }

  /**
   * Get all courses that need mapping (unknown courses)
   */
  getUnknownCourses(grades: any[], assignments: any[] = []): Array<{courseId: string, originalName?: string}> {
    const unknownCourses = new Set<string>()
    const results: Array<{courseId: string, originalName?: string}> = []

    // Check grades
    grades.forEach(grade => {
      if (grade.course_id && this.isUnknownCourse(grade.course_name) && !this.mappings.has(grade.course_id)) {
        unknownCourses.add(grade.course_id)
        results.push({
          courseId: grade.course_id,
          originalName: grade.course_name
        })
      }
    })

    // Check assignments
    assignments.forEach(assignment => {
      const courseId = assignment.course_id?.toString()
      const courseName = assignment.course?.name || assignment.course_name
      
      if (courseId && this.isUnknownCourse(courseName) && !this.mappings.has(courseId) && !unknownCourses.has(courseId)) {
        unknownCourses.add(courseId)
        results.push({
          courseId: courseId,
          originalName: courseName
        })
      }
    })

    return results
  }

  /**
   * Transform an array of grades/assignments to use mapped course names
   */
  transformWithMappings<T extends {course_id?: string, course_name?: string}>(items: T[]): T[] {
    return items.map(item => ({
      ...item,
      course_name: item.course_id ? this.getCourseName(item.course_id, item.course_name) : item.course_name
    }))
  }
}

// Global course name mapper instance
export const courseNameMapper = new CourseNameMapper()

/**
 * Hook for managing course name mappings
 */
export function useCourseNameMapper() {
  return {
    mapper: courseNameMapper,
    getCourseName: (courseId: string, originalName?: string) => 
      courseNameMapper.getCourseName(courseId, originalName),
    isUnknownCourse: (courseName?: string) => 
      courseNameMapper.isUnknownCourse(courseName),
    transformWithMappings: <T extends {course_id?: string, course_name?: string}>(items: T[]) =>
      courseNameMapper.transformWithMappings(items)
  }
}
