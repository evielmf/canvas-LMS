'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { Bell, Plus, X, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Reminder {
  id: string
  title: string
  description?: string
  due_date: string
  reminder_time: string
  assignment_id?: number
  created_at: string
}

export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user, supabase } = useSupabase()

  useEffect(() => {
    setMounted(true)
    if (user) {
      loadReminders()
    }
  }, [user])

  const loadReminders = async () => {
    try {
      // Debug logging
      console.log('Loading reminders for user:', user?.id)
      
      if (!user?.id) {
        console.log('No user ID available, skipping reminders load')
        return
      }

      // Load all reminders first to avoid hydration mismatch
      const { data, error } = await supabase
        .from('study_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .limit(10) // Get more to filter client-side

      if (error) {
        console.error('Supabase error loading reminders:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Reminders data loaded:', data)
      
      // Filter on client side to avoid hydration mismatch
      const filteredData = mounted 
        ? (data || []).filter(reminder => new Date(reminder.due_date) >= new Date()).slice(0, 5)
        : data?.slice(0, 5) || []
      
      setReminders(filteredData)
    } catch (error: any) {
      console.error('Error loading reminders:', error?.message || 'Unknown error', error)
      toast.error('Failed to load reminders')
    } finally {
      setLoading(false)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('study_reminders')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setReminders(reminders.filter(r => r.id !== id))
      toast.success('Reminder deleted')
    } catch (error) {
      console.error('Error deleting reminder:', error)
      toast.error('Failed to delete reminder')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Study Reminders</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-canvas-blue hover:text-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Reminder
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-start justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{format(new Date(reminder.due_date), 'MMM d')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{format(new Date(reminder.reminder_time), 'h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Delete reminder"
                  title="Delete reminder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reminders set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create study reminders to stay on top of your assignments.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-canvas-blue rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Reminder
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddReminderForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            loadReminders()
          }}
        />
      )}
    </div>
  )
}

interface AddReminderFormProps {
  onClose: () => void
  onSuccess: () => void
}

function AddReminderForm({ onClose, onSuccess }: AddReminderFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, supabase } = useSupabase()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !dueDate || !reminderTime || !user) return

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('study_reminders')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          due_date: dueDate,
          reminder_time: reminderTime,
        })

      if (error) throw error
      
      toast.success('Reminder created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast.error('Failed to create reminder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Study Reminder</h3>
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
              placeholder="Study for midterm exam"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Review chapters 5-8, practice problems"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue resize-none"
            />
          </div>

          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={mounted ? new Date().toISOString().split('T')[0] : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              required
            />
          </div>

          <div>
            <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Time
            </label>
            <input
              id="reminder-time"
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !title || !dueDate || !reminderTime}
              className="flex-1 bg-canvas-blue text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Reminder'}
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
