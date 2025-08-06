'use client'

import { useState } from 'react'
import { Edit3, Save, X, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCourseNameMappings } from '@/hooks/useCourseNameMappings'
import { useCourseNameMapper } from '@/utils/course-name-mapper'
import { useCanvasData } from '@/hooks/useCanvasData'
import { toast } from 'sonner'

interface CourseNameMappingManagerProps {
  onClose?: () => void
}

export default function CourseNameMappingManager({ onClose }: CourseNameMappingManagerProps) {
  const { assignments, grades } = useCanvasData()
  const { mappings, createMapping, deleteMapping, isCreating, isDeleting } = useCourseNameMappings()
  const { mapper } = useCourseNameMapper()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newMappings, setNewMappings] = useState<{[key: string]: string}>({})

  // Get unknown courses that need mapping
  const unknownCourses = mapper.getUnknownCourses(grades || [], assignments || [])
  
  // Filter out courses that already have mappings
  const coursesNeedingMapping = unknownCourses.filter(
    course => !mappings.find(mapping => mapping.course_id === course.courseId)
  )

  const handleSaveMapping = async (courseId: string, mappedName: string, originalName?: string) => {
    if (!mappedName.trim()) {
      toast.error('Course name cannot be empty')
      return
    }

    try {
      await createMapping({
        course_id: courseId,
        original_name: originalName,
        mapped_name: mappedName.trim()
      })
      
      toast.success('Course name mapping saved!')
      setEditingId(null)
      setEditingName('')
      
      // Clear from new mappings if it was there
      const updated = { ...newMappings }
      delete updated[courseId]
      setNewMappings(updated)
    } catch (error) {
      toast.error('Failed to save course mapping')
    }
  }

  const handleDeleteMapping = async (courseId: string) => {
    try {
      await deleteMapping(courseId)
      toast.success('Course mapping deleted!')
    } catch (error) {
      toast.error('Failed to delete course mapping')
    }
  }

  const handleNewMappingChange = (courseId: string, value: string) => {
    setNewMappings(prev => ({
      ...prev,
      [courseId]: value
    }))
  }

  const handleSaveNewMapping = (courseId: string, originalName?: string) => {
    const mappedName = newMappings[courseId]
    if (mappedName) {
      handleSaveMapping(courseId, mappedName, originalName)
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-sage-100 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-sage-600" />
            <CardTitle className="font-heading text-warm-gray-800">Course Name Mappings</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Assign custom names to courses that appear as "Unknown Course"
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Courses needing mapping */}
        {coursesNeedingMapping.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-warm-gray-800 mb-3 flex items-center">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
              Courses Need Names ({coursesNeedingMapping.length})
            </h3>
            <div className="space-y-3">
              {coursesNeedingMapping.map((course) => (
                <div 
                  key={course.courseId}
                  className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-gray-800">
                      Course ID: {course.courseId}
                    </p>
                    {course.originalName && (
                      <p className="text-xs text-warm-gray-600">
                        Original: {course.originalName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter course name..."
                      value={newMappings[course.courseId] || ''}
                      onChange={(e) => handleNewMappingChange(course.courseId, e.target.value)}
                      className="w-48"
                      disabled={isCreating}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveNewMapping(course.courseId, course.originalName)}
                      disabled={isCreating || !newMappings[course.courseId]?.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing mappings */}
        {mappings.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-warm-gray-800 mb-3">
              Existing Mappings ({mappings.length})
            </h3>
            <div className="space-y-3">
              {mappings.map((mapping) => (
                <div 
                  key={mapping.id}
                  className="flex items-center space-x-3 p-3 bg-sage-50 border border-sage-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-gray-800">
                      Course ID: {mapping.course_id}
                    </p>
                    {mapping.original_name && (
                      <p className="text-xs text-warm-gray-600">
                        Original: {mapping.original_name}
                      </p>
                    )}
                    <p className="text-xs text-sage-600">
                      Mapped to: <span className="font-medium">{mapping.mapped_name}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingId === mapping.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-48"
                          disabled={isCreating}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveMapping(mapping.course_id, editingName, mapping.original_name)}
                          disabled={isCreating || !editingName.trim()}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null)
                            setEditingName('')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(mapping.id)
                            setEditingName(mapping.mapped_name)
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMapping(mapping.course_id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {coursesNeedingMapping.length === 0 && mappings.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-warm-gray-300 mx-auto mb-3" />
            <p className="text-warm-gray-600">
              No course mappings needed. All your courses have proper names!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
