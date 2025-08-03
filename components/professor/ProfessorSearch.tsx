'use client'

import React, { useState } from 'react'
import { Search, Star, TrendingUp, Users, BookOpen, AlertCircle, Loader2, GraduationCap, School } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface ProfessorData {
  name: string
  department: string
  school: string
  rating: number | string
  difficulty: number | string
  would_take_again: number | string
  num_ratings: number
}

interface ProfessorSearchResponse {
  success: boolean
  professor?: ProfessorData
  error?: string
}

const ProfessorSearch: React.FC = () => {
  const [schoolName, setSchoolName] = useState('')
  const [professorName, setProfessorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [professor, setProfessor] = useState<ProfessorData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!schoolName.trim() || !professorName.trim()) {
      toast.error('Please enter both school name and professor name')
      return
    }

    setIsLoading(true)
    setError(null)
    setProfessor(null)

    try {
      const params = new URLSearchParams({
        school_name: schoolName.trim(),
        professor_name: professorName.trim()
      })

      // In development, use localhost:8000. In production, use your FastAPI backend URL
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

      const response = await fetch(`${backendUrl}/api/professor?${params}`)
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data: ProfessorSearchResponse = await response.json()

      if (data.success && data.professor) {
        setProfessor(data.professor)
        toast.success('Professor found!')
      } else {
        setError(data.error || 'Professor not found')
        toast.error(data.error || 'Professor not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search for professor'
      setError(`Connection error: ${errorMessage}. Make sure the FastAPI server is running on port 8000.`)
      toast.error('Failed to connect to search service')
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingColor = (rating: number | string) => {
    if (rating === 'N/A') return 'text-warm-gray-500'
    const num = typeof rating === 'string' ? parseFloat(rating) : rating
    if (num >= 4) return 'text-sage-600'
    if (num >= 3) return 'text-soft-blue-500'
    return 'text-orange-500'
  }

  const getRatingBg = (rating: number | string) => {
    if (rating === 'N/A') return 'bg-warm-gray-100'
    const num = typeof rating === 'string' ? parseFloat(rating) : rating
    if (num >= 4) return 'bg-sage-100'
    if (num >= 3) return 'bg-soft-blue-100'
    return 'bg-orange-100'
  }

  const getDifficultyColor = (difficulty: number | string) => {
    if (difficulty === 'N/A') return 'text-warm-gray-500'
    const num = typeof difficulty === 'string' ? parseFloat(difficulty) : difficulty
    if (num >= 4) return 'text-red-600'
    if (num >= 3) return 'text-orange-500'
    return 'text-sage-600'
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header with peaceful design */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-sage-100 to-cream-100 rounded-3xl shadow-soft">
            <GraduationCap className="w-12 h-12 text-sage-600" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-heading font-semibold text-warm-gray-800 tracking-tight">
            Professor Insights
          </h1>
          <p className="text-lg text-warm-gray-600 leading-relaxed max-w-2xl mx-auto">
            Discover valuable insights about your professors from student reviews to make informed course decisions ✨
          </p>
        </div>
      </div>

      {/* Search Form with enhanced styling */}
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-heading text-warm-gray-800 flex items-center gap-3">
            <div className="p-2 bg-sage-100 rounded-xl">
              <Search className="w-6 h-6 text-sage-600" />
            </div>
            Search for Professor
          </CardTitle>
          <CardDescription className="text-warm-gray-600 text-base leading-relaxed">
            Enter your school and professor's name to discover their ratings, difficulty level, and student feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="school" className="text-warm-gray-700 font-medium flex items-center gap-2">
                  <School className="w-4 h-4 text-sage-600" />
                  School Name
                </Label>
                <Input
                  id="school"
                  type="text"
                  placeholder="e.g., University of California Berkeley"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="h-12 bg-cream-50 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 rounded-xl text-base"
                  disabled={isLoading}
                />
                <p className="text-sm text-warm-gray-500">Use the full official school name for best results</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="professor" className="text-warm-gray-700 font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sage-600" />
                  Professor Name
                </Label>
                <Input
                  id="professor"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  className="h-12 bg-cream-50 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 rounded-xl text-base"
                  disabled={isLoading}
                />
                <p className="text-sm text-warm-gray-500">Include both first and last name</p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !schoolName.trim() || !professorName.trim()}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 text-base shadow-gentle hover:shadow-soft disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching professor data...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  Find Professor Ratings
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display with improved styling */}
      {error && (
        <Card className="border-red-200 bg-red-50 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-red-800 text-lg">Search Error</h3>
                <p className="text-red-700 leading-relaxed">{error}</p>
                <p className="text-sm text-red-600 mt-3">
                  💡 <strong>Tips:</strong> Make sure to use the exact school name and try different variations of the professor's name.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professor Results with enhanced design */}
      {professor && (
        <Card className="bg-white/90 backdrop-blur-sm border-sage-200 shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-sage-50 to-cream-50 border-b border-sage-100 pb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <CardTitle className="text-3xl font-heading text-warm-gray-800">{professor.name}</CardTitle>
                <CardDescription className="text-lg space-y-2">
                  <div className="flex items-center gap-2 text-warm-gray-700">
                    <BookOpen className="w-5 h-5 text-sage-600" />
                    <span className="font-medium">{professor.department} Department</span>
                  </div>
                  <div className="flex items-center gap-2 text-warm-gray-600">
                    <School className="w-5 h-5 text-sage-600" />
                    <span>{professor.school}</span>
                  </div>
                </CardDescription>
              </div>
              <div className="text-right bg-white/60 p-4 rounded-2xl border border-sage-100">
                <div className="flex items-center gap-2 text-sm text-warm-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span>Student Reviews</span>
                </div>
                <div className="text-3xl font-bold text-sage-600">
                  {professor.num_ratings}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Overall Rating */}
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 shadow-gentle">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-2xl">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Overall Rating</p>
                  <p className={`text-4xl font-bold ${getRatingColor(professor.rating)}`}>
                    {professor.rating}
                    {professor.rating !== 'N/A' && <span className="text-lg text-warm-gray-500">/5.0</span>}
                  </p>
                  <p className="text-sm text-green-700">Student satisfaction</p>
                </div>
              </div>

              {/* Difficulty */}
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-100 shadow-gentle">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-orange-100 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide">Difficulty Level</p>
                  <p className={`text-4xl font-bold ${getDifficultyColor(professor.difficulty)}`}>
                    {professor.difficulty}
                    {professor.difficulty !== 'N/A' && <span className="text-lg text-warm-gray-500">/5.0</span>}
                  </p>
                  <p className="text-sm text-orange-700">Course challenge</p>
                </div>
              </div>

              {/* Would Take Again */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 shadow-gentle">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Would Take Again</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {professor.would_take_again === 'N/A' 
                      ? 'N/A' 
                      : `${professor.would_take_again}%`
                    }
                  </p>
                  <p className="text-sm text-blue-700">Student recommendation</p>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-8 p-6 bg-gradient-to-br from-cream-50 to-sage-50 rounded-3xl border border-cream-200">
              <h4 className="font-semibold text-warm-gray-800 mb-4 flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-sage-600" />
                Professor Summary
              </h4>
              <p className="text-warm-gray-700 leading-relaxed text-base">
                <strong>{professor.name}</strong> teaches in the <strong>{professor.department}</strong> department at <strong>{professor.school}</strong>. 
                Based on <strong>{professor.num_ratings}</strong> student reviews, they have earned an overall rating of <strong>{professor.rating}</strong>
                {professor.rating !== 'N/A' && ' out of 5'} stars and a difficulty level of <strong>{professor.difficulty}</strong>
                {professor.difficulty !== 'N/A' && ' out of 5'}.
                {professor.would_take_again !== 'N/A' && 
                  ` Additionally, ${professor.would_take_again}% of students would recommend taking their class again.`
                }
              </p>
              
              {/* Rating Guide */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span><strong>Rating:</strong> Student satisfaction (1-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span><strong>Difficulty:</strong> Course challenge (1-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span><strong>Would Take Again:</strong> % recommendation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & Tips Card */}
      <Card className="bg-gradient-to-br from-cream-50 to-lavender-50 border-cream-200 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-soft-blue-100 rounded-2xl">
              <BookOpen className="w-6 h-6 text-soft-blue-600" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-warm-gray-800 text-lg">How Professor Insights Works</h3>
              <p className="text-warm-gray-700 leading-relaxed">
                This tool searches RateMyProfessor.com to find ratings and reviews from real students. 
                Use these insights to make informed decisions about your courses and professors.
              </p>
              <div className="space-y-2 text-sm text-warm-gray-600">
                <p><strong>💡 Pro Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the exact official school name (e.g., "University of California Berkeley" not "UC Berkeley")</li>
                  <li>Include both first and last name for professors</li>
                  <li>Try variations if the first search doesn't work (middle initial, nickname, etc.)</li>
                  <li>Remember that ratings are subjective - consider the context and number of reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfessorSearch
