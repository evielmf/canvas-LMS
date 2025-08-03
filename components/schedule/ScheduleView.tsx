'use client'

import { useState, useEffect } from 'react'
import './ScheduleView.css'
import { useSupabase } from '@/app/providers'
import { 
  Calendar,
  Clock, 
  Plus,
  Edit,
  Trash2,
  MapPin,
  X,
  Save,
  BookOpen
} from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'

interface ScheduleItem {
  id: string
  title: string
  course_name?: string
  day_of_week: number
  start_time: string
  end_time: string
  location?: string
  color: string
  created_at: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export default function ScheduleView() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user, supabase } = useSupabase()

  useEffect(() => {
    setMounted(true)
    setCurrentWeek(new Date())
  }, [])

  useEffect(() => {
    if (user) {
      loadSchedule()
    }
  }, [user])

  const loadSchedule = async () => {
    try {
      // Debug logging
      console.log('Loading schedule for user:', user?.id)
      
      if (!user?.id) {
        console.log('No user ID available, skipping schedule load')
        return
      }

      const { data, error } = await supabase
        .from('weekly_schedule')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Supabase error loading schedule:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Schedule data loaded:', data)
      setScheduleItems(data || [])
    } catch (error: any) {
      console.error('Error loading schedule:', error?.message || 'Unknown error', error)
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const deleteScheduleItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_schedule')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setScheduleItems(scheduleItems.filter(item => item.id !== id))
      toast.success('Schedule item deleted')
    } catch (error) {
      console.error('Error deleting schedule item:', error)
      toast.error('Failed to delete schedule item')
    }
  }

  const getItemsForDay = (dayIndex: number) => {
    return scheduleItems.filter(item => item.day_of_week === dayIndex)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDayDate = (dayIndex: number) => {
    if (!currentWeek) return new Date()
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 })
    return addDays(weekStart, dayIndex)
  }

  const isToday = (dayIndex: number) => {
    if (!mounted || !currentWeek) return false
    return isSameDay(getDayDate(dayIndex), new Date())
  }

  const getTodayIndex = () => {
    if (!mounted) return 0
    return new Date().getDay()
  }

  if (loading || !mounted || !currentWeek) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
          <p className="text-gray-600">
            Manage your class schedule and weekly commitments.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-canvas-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule Item
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Previous Week
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Week of {format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'MMM d, yyyy')}
          </h2>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                isToday(index) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-semibold text-gray-900">{day}</div>
              <div className={`text-sm ${isToday(index) ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {format(getDayDate(index), 'MMM d')}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-7 min-h-96">
          {DAYS.map((day, dayIndex) => (
            <div
              key={day}
              className={`border-r border-gray-200 last:border-r-0 p-2 min-h-96 ${
                isToday(dayIndex) ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="space-y-2">
                {getItemsForDay(dayIndex).map((item) => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => deleteScheduleItem(item.id)}
                  />
                ))}
                
                {getItemsForDay(dayIndex).length === 0 && (
                  <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
                    No classes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule Summary */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {getItemsForDay(getTodayIndex()).length > 0 ? (
            getItemsForDay(getTodayIndex())
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full schedule-item-color" 
                    data-color={item.color}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    {item.course_name && (
                      <div className="text-sm text-gray-600">{item.course_name}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </div>
                  {item.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location}
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>No classes scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <ScheduleForm
          item={editingItem}
          onClose={() => {
            setShowAddForm(false)
            setEditingItem(null)
          }}
          onSuccess={() => {
            setShowAddForm(false)
            setEditingItem(null)
            loadSchedule()
          }}
        />
      )}
    </div>
  )
}

interface ScheduleItemCardProps {
  item: ScheduleItem
  onEdit: () => void
  onDelete: () => void
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
      className="p-3 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow group schedule-card"
      data-color={item.color}
      aria-label={`Schedule item: ${item.title}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.title}
          </h4>
          {item.course_name && (
            <p className="text-xs text-gray-600 mt-1">{item.course_name}</p>
          )}
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
          </div>
          {item.location && (
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Edit schedule item"
            title="Edit schedule item"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

interface ScheduleFormProps {
  item?: ScheduleItem | null
  onClose: () => void
  onSuccess: () => void
}

function ScheduleForm({ item, onClose, onSuccess }: ScheduleFormProps) {
  const [title, setTitle] = useState(item?.title || '')
  const [courseName, setCourseName] = useState(item?.course_name || '')
  const [dayOfWeek, setDayOfWeek] = useState(item?.day_of_week ?? 1)
  const [startTime, setStartTime] = useState(item?.start_time || '09:00')
  const [endTime, setEndTime] = useState(item?.end_time || '10:00')
  const [location, setLocation] = useState(item?.location || '')
  const [color, setColor] = useState(item?.color || COLORS[0])
  const [loading, setLoading] = useState(false)
  const { user, supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !user) return

    setLoading(true)
    
    try {
      const scheduleData = {
        user_id: user.id,
        title,
        course_name: courseName || null,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        location: location || null,
        color,
      }

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('weekly_schedule')
          .update(scheduleData)
          .eq('id', item.id)

        if (error) throw error
        toast.success('Schedule item updated!')
      } else {
        // Create new item
        const { error } = await supabase
          .from('weekly_schedule')
          .insert(scheduleData)

        if (error) throw error
        toast.success('Schedule item created!')
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving schedule item:', error)
      toast.error('Failed to save schedule item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {item ? 'Edit Schedule Item' : 'Add Schedule Item'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Calculus I"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              required
            />
          </div>

          <div>
            <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-1">
              Course Name (optional)
            </label>
            <input
              id="course-name"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., MATH 101"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            />
          </div>

          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week
            </label>
            <select
              id="day"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            >
              {DAYS.map((day, index) => (
                <option key={day} value={index}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                required
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Science Building Room 205"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 color-picker-option ${
                    color === colorOption ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  data-color={colorOption}
                  aria-label={`Select color ${colorOption}`}
                  title={`Select color ${colorOption}`}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 bg-canvas-blue text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
