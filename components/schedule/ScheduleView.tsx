'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Plus, X, Save, Edit, Trash2, List, Grid, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import FloatingActionButton from '../dashboard/FloatingActionButton'
import BottomSheet from '../ui/BottomSheet'
import PullToRefresh from '../ui/PullToRefresh'

interface ScheduleItem {
  id: string
  title: string
  course_name?: string
  day_of_week: number
  start_time: string
  end_time: string
  location?: string
  color: string
  user_id: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

export default function ScheduleView() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setViewMode('grid')
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const loadSchedule = async () => {
    try {
      // Mock data for now - replace with actual Supabase call
      setScheduleItems([])
    } catch (error) {
      console.error('Error loading schedule:', error)
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  const handleRefresh = async () => {
    await loadSchedule()
  }

  const isToday = (dayIndex: number) => {
    const today = new Date().getDay()
    const adjustedToday = today === 0 ? 6 : today - 1
    return dayIndex === adjustedToday
  }

  const getTodayIndex = () => {
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getItemsForDay = (dayIndex: number) => {
    return scheduleItems.filter(item => item.day_of_week === dayIndex)
  }

  const deleteScheduleItem = async (id: string) => {
    try {
      setScheduleItems(prev => prev.filter(item => item.id !== id))
      toast.success('Schedule item deleted')
    } catch (error) {
      console.error('Error deleting schedule item:', error)
      toast.error('Failed to delete schedule item')
    }
  }

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (currentWeekOffset * 7))
    
    return DAYS.map((_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return date
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-warm-gray-600">Loading your schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-sage-25 via-cream-25 to-lavender-25 lg:bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-sage-200 sticky top-0 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-heading font-bold text-warm-gray-900">
                Weekly Schedule
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 text-warm-gray-600 hover:text-sage-600 hover:bg-sage-50 rounded-xl transition-all duration-200"
                  aria-label={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
                >
                  {viewMode === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowFilters(true)}
                  className="p-2 text-warm-gray-600 hover:text-sage-600 hover:bg-sage-50 rounded-xl transition-all duration-200"
                  aria-label="Show filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search classes, courses, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-warm-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-warm-gray-900">Weekly Schedule</h1>
              <p className="text-warm-gray-600 mt-1">Manage your weekly class schedule</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search schedule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-sage-50 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700 flex items-center space-x-2 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Week Navigation (Mobile) */}
          {isMobile && (
            <div className="flex items-center justify-between mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-soft">
              <button
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className="p-2 text-warm-gray-600 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all duration-200"
                aria-label="Previous week"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <p className="text-sm font-medium text-warm-gray-900">
                  {currentWeekOffset === 0 ? 'This Week' : 
                   currentWeekOffset === 1 ? 'Next Week' :
                   currentWeekOffset === -1 ? 'Last Week' :
                   `Week of ${getWeekDates()[0].toLocaleDateString()}`}
                </p>
              </div>
              
              <button
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className="p-2 text-warm-gray-600 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all duration-200"
                aria-label="Next week"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mobile List View */}
          {isMobile && viewMode === 'list' ? (
            <div className="space-y-6">
              {DAYS.map((day, dayIndex) => {
                const dayItems = getItemsForDay(dayIndex).filter(item => {
                  const matchesSearch = !searchQuery || 
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.location?.toLowerCase().includes(searchQuery.toLowerCase())
                  return matchesSearch
                })

                if (dayItems.length === 0 && searchQuery) return null

                const weekDates = getWeekDates()
                const dayDate = weekDates[dayIndex]

                return (
                  <div key={day} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft overflow-hidden">
                    <div className={`p-4 border-b border-warm-gray-100 ${
                      isToday(dayIndex) ? 'bg-sage-50' : 'bg-warm-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${
                            isToday(dayIndex) ? 'text-sage-700' : 'text-warm-gray-900'
                          }`}>
                            {day}
                          </h3>
                          <p className="text-sm text-warm-gray-600">
                            {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {isToday(dayIndex) && (
                          <span className="px-2 py-1 bg-sage-600 text-white text-xs rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {dayItems.length > 0 ? (
                        <div className="space-y-3">
                          {dayItems.map((item) => (
                            <ScheduleItemCard
                              key={item.id}
                              item={item}
                              onEdit={() => setEditingItem(item)}
                              onDelete={deleteScheduleItem}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-warm-gray-500">
                          <Calendar className="mx-auto h-8 w-8 text-warm-gray-400 mb-2" />
                          <p className="text-sm">No classes scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Grid View (Mobile & Desktop) */
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {/* Days Header */}
              <div className="grid grid-cols-7 bg-warm-gray-50 border-b border-warm-gray-200">
                {DAYS.map((day, dayIndex) => {
                  const weekDates = getWeekDates()
                  const dayDate = weekDates[dayIndex]
                  
                  return (
                    <div
                      key={day}
                      className={`p-3 lg:p-4 text-center border-r border-warm-gray-200 last:border-r-0 ${
                        isToday(dayIndex) ? 'bg-sage-100 text-sage-700' : 'text-warm-gray-700'
                      }`}
                    >
                      <div className="font-semibold text-sm lg:text-base">{day.slice(0, 3)}</div>
                      <div className="text-xs lg:text-sm text-warm-gray-500 mt-1">
                        {dayDate.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Schedule Grid */}
              <div className="grid grid-cols-7 min-h-96">
                {DAYS.map((day, dayIndex) => (
                  <div
                    key={day}
                    className={`border-r border-warm-gray-200 last:border-r-0 p-2 min-h-96 ${
                      isToday(dayIndex) ? 'bg-sage-25' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {getItemsForDay(dayIndex).map((item) => (
                        <ScheduleItemCard
                          key={item.id}
                          item={item}
                          onEdit={() => setEditingItem(item)}
                          onDelete={deleteScheduleItem}
                        />
                      ))}
                      
                      {getItemsForDay(dayIndex).length === 0 && (
                        <div className="h-20 flex items-center justify-center text-warm-gray-400 text-sm">
                          No classes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Schedule Summary */}
          <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-warm-gray-100 p-6">
            <h3 className="text-lg font-heading font-semibold text-warm-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {getItemsForDay(getTodayIndex()).length > 0 ? (
                getItemsForDay(getTodayIndex())
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-sage-25 rounded-xl hover:bg-sage-50 transition-all duration-200">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-warm-gray-900 line-clamp-1">{item.title}</div>
                        {item.course_name && (
                          <div className="text-sm text-warm-gray-600 line-clamp-1">{item.course_name}</div>
                        )}
                      </div>
                      <div className="text-sm text-warm-gray-500 flex-shrink-0">
                        {formatTime(item.start_time)} - {formatTime(item.end_time)}
                      </div>
                      {item.location && (
                        <div className="hidden lg:flex items-center text-sm text-warm-gray-500 flex-shrink-0">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-warm-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-warm-gray-400 mb-2" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        {isMobile && (
          <FloatingActionButton
            onAddSchedule={() => setShowAddForm(true)}
          />
        )}

        {/* Mobile Filters Bottom Sheet */}
        <BottomSheet
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filter Schedule"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warm-gray-800 mb-3">
                Filter by Day
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedDay(null)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedDay === null
                      ? 'bg-sage-600 text-white'
                      : 'bg-sage-50 text-warm-gray-700 hover:bg-sage-100'
                  }`}
                >
                  All Days
                </button>
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(index)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedDay === index
                        ? 'bg-sage-600 text-white'
                        : 'bg-sage-50 text-warm-gray-700 hover:bg-sage-100'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-sage-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-sage-700 transition-all duration-200"
            >
              Apply Filters
            </button>
          </div>
        </BottomSheet>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingItem) && (
          <ScheduleFormModal
            item={editingItem}
            onClose={() => {
              setShowAddForm(false)
              setEditingItem(null)
            }}
            onSave={async (data) => {
              // Mock save - replace with actual implementation
              console.log('Save data:', data)
              toast.success(editingItem ? 'Schedule item updated!' : 'Schedule item added!')
              setShowAddForm(false)
              setEditingItem(null)
            }}
          />
        )}
      </div>
    </PullToRefresh>
  )
}

interface ScheduleItemCardProps {
  item: ScheduleItem
  onEdit: () => void
  onDelete: (id: string) => void
}

function ScheduleItemCard({ item, onEdit, onDelete }: ScheduleItemCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div 
      className="p-3 rounded-xl border-l-4 bg-white/90 backdrop-blur-sm shadow-soft hover:shadow-soft-hover transition-all duration-200 group schedule-card"
      style={{ borderLeftColor: item.color }}
      aria-label={`Schedule item: ${item.title}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-warm-gray-800 line-clamp-1">
            {item.title}
          </h4>
          {item.course_name && (
            <p className="text-xs text-warm-gray-600 mt-1 line-clamp-1">{item.course_name}</p>
          )}
          <div className="flex items-center mt-2 text-xs text-warm-gray-500">
            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
          </div>
          {item.location && (
            <div className="flex items-center mt-1 text-xs text-warm-gray-500">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-warm-gray-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all duration-200"
            aria-label="Edit schedule item"
            title="Edit schedule item"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-warm-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            aria-label="Delete schedule item"
            title="Delete schedule item"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ScheduleFormModalProps {
  item?: ScheduleItem | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

function ScheduleFormModal({ item, onClose, onSave }: ScheduleFormModalProps) {
  const [title, setTitle] = useState(item?.title || '')
  const [courseName, setCourseName] = useState(item?.course_name || '')
  const [dayOfWeek, setDayOfWeek] = useState(item?.day_of_week ?? 1)
  const [startTime, setStartTime] = useState(item?.start_time || '09:00')
  const [endTime, setEndTime] = useState(item?.end_time || '10:00')
  const [location, setLocation] = useState(item?.location || '')
  const [color, setColor] = useState(item?.color || COLORS[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setLoading(true)
    
    try {
      const scheduleData = {
        title,
        course_name: courseName || null,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        location: location || null,
        color,
      }

      await onSave(scheduleData)
      onClose()
    } catch (error) {
      console.error('Error saving schedule item:', error)
      toast.error('Failed to save schedule item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-warm-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold text-warm-gray-800">
              {item ? 'Edit Schedule Item' : 'Add Schedule Item'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-warm-gray-400 hover:text-warm-gray-600 hover:bg-warm-gray-100 rounded-xl transition-all duration-200"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-warm-gray-800 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Calculus I"
              className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="course-name" className="block text-sm font-medium text-warm-gray-800 mb-2">
              Course Name (optional)
            </label>
            <input
              id="course-name"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., MATH 101"
              className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-warm-gray-800 mb-2">
                Day
              </label>
              <select
                id="day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
              >
                {DAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-warm-gray-800 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                      color === colorOption ? 'border-warm-gray-400 scale-110' : 'border-warm-gray-200'
                    }`}
                    style={{ backgroundColor: colorOption }}
                    aria-label={`Select color ${colorOption}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-warm-gray-800 mb-2">
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-warm-gray-800 mb-2">
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-warm-gray-800 mb-2">
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Room 101, Science Building"
              className="w-full px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 bg-sage-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-warm-gray-700 bg-warm-gray-100 rounded-xl hover:bg-warm-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
