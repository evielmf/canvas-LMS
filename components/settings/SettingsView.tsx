'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import CryptoJS from 'crypto-js'

interface CanvasToken {
  canvas_url: string
  encrypted_token: string
  created_at: string
  updated_at: string
}

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('canvas')
  const [canvasToken, setCanvasToken] = useState<CanvasToken | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [newCanvasUrl, setNewCanvasUrl] = useState('')
  const [newToken, setNewToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { user, supabase } = useSupabase()

  useEffect(() => {
    if (user) {
      loadCanvasToken()
    }
  }, [user])

  const loadCanvasToken = async () => {
    try {
      const { data, error } = await supabase
        .from('canvas_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setCanvasToken(data)
      if (data) {
        setNewCanvasUrl(data.canvas_url)
      }
    } catch (error) {
      console.error('Error loading Canvas token:', error)
    }
  }

  const encryptToken = (token: string) => {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'canvas-dashboard-key'
    return CryptoJS.AES.encrypt(token, encryptionKey).toString()
  }

  const decryptToken = (encryptedToken: string) => {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'canvas-dashboard-key'
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Error decrypting token:', error)
      return null
    }
  }

  const testCanvasConnection = async (url: string, token: string) => {
    try {
      const response = await fetch('/api/canvas/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvasUrl: url,
          token: token,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Canvas connection test failed:', data)
        return false
      }

      console.log('Canvas connection successful:', data)
      return true
    } catch (error) {
      console.error('Error testing Canvas connection:', error)
      return false
    }
  }

  const handleUpdateCanvas = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCanvasUrl || !newToken || !user) return

    setLoading(true)
    
    try {
      // Normalize Canvas URL
      const normalizedUrl = newCanvasUrl.replace(/\/+$/, '')
      
      // Test connection
      const isValid = await testCanvasConnection(normalizedUrl, newToken)
      if (!isValid) {
        toast.error('Invalid Canvas URL or token. Please check your credentials.')
        setLoading(false)
        return
      }

      // Encrypt and store token
      const encryptedToken = encryptToken(newToken)
      
      const { error } = await supabase
        .from('canvas_tokens')
        .upsert({
          user_id: user.id,
          canvas_url: normalizedUrl,
          encrypted_token: encryptedToken,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Canvas settings updated successfully!')
      setNewToken('')
      loadCanvasToken()
    } catch (error) {
      console.error('Error updating Canvas settings:', error)
      toast.error('Failed to update Canvas settings')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCanvas = async () => {
    if (!user || !canvasToken) return
    
    if (!confirm('Are you sure you want to remove your Canvas integration? This will also delete all cached Canvas data.')) {
      return
    }

    setDeleteLoading(true)
    
    try {
      // Delete Canvas token
      const { error: tokenError } = await supabase
        .from('canvas_tokens')
        .delete()
        .eq('user_id', user.id)

      if (tokenError) throw tokenError

      // Delete cached data
      const { error: assignmentsError } = await supabase
        .from('canvas_assignments_cache')
        .delete()
        .eq('user_id', user.id)

      const { error: coursesError } = await supabase
        .from('canvas_courses_cache')
        .delete()
        .eq('user_id', user.id)

      toast.success('Canvas integration removed successfully!')
      setCanvasToken(null)
      setNewCanvasUrl('')
      setNewToken('')
    } catch (error) {
      console.error('Error deleting Canvas integration:', error)
      toast.error('Failed to remove Canvas integration')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const tabs = [
    { id: 'canvas', label: 'Canvas Integration', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and integrations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-canvas-blue text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'canvas' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Canvas Integration</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your Canvas LMS connection settings.
                </p>
              </div>

              <div className="p-6">
                {canvasToken ? (
                  <div className="space-y-6">
                    {/* Current Integration Status */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Settings className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-green-800">
                            Canvas Integration Active
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Connected to: <span className="font-medium">{canvasToken.canvas_url}</span></p>
                            <p>Last updated: {new Date(canvasToken.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Update Settings Form */}
                    <form onSubmit={handleUpdateCanvas} className="space-y-4">
                      <div>
                        <label htmlFor="canvas-url-update" className="block text-sm font-medium text-gray-700 mb-2">
                          Canvas URL
                        </label>
                        <input
                          id="canvas-url-update"
                          type="url"
                          value={newCanvasUrl}
                          onChange={(e) => setNewCanvasUrl(e.target.value)}
                          placeholder="https://yourschool.instructure.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent text-gray-900 placeholder-gray-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="canvas-token-update" className="block text-sm font-medium text-gray-700 mb-2">
                          New Canvas API Token
                        </label>
                        <div className="relative">
                          <input
                            id="canvas-token-update"
                            type={showToken ? 'text' : 'password'}
                            value={newToken}
                            onChange={(e) => setNewToken(e.target.value)}
                            placeholder="Enter a new Canvas API token to update"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-transparent text-gray-900 placeholder-gray-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showToken ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Leave blank to keep current token
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading || !newCanvasUrl}
                          className="inline-flex items-center px-4 py-2 bg-canvas-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {loading ? 'Updating...' : 'Update Settings'}
                        </button>

                        <button
                          type="button"
                          onClick={handleDeleteCanvas}
                          disabled={deleteLoading}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {deleteLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          {deleteLoading ? 'Removing...' : 'Remove Integration'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Canvas Integration
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Connect your Canvas account to sync assignments, grades, and courses.
                    </p>
                    <a
                      href="/dashboard"
                      className="inline-flex items-center px-4 py-2 bg-canvas-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Setup Canvas Integration
                    </a>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">How to get your Canvas API token:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Log in to your Canvas account</li>
                    <li>Go to Account → Settings</li>
                    <li>Scroll down to "Approved Integrations"</li>
                    <li>Click "New Access Token"</li>
                    <li>Enter a purpose (e.g., "Student Dashboard")</li>
                    <li>Copy the generated token and paste it above</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage your account details.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Information */}
                <div className="flex items-center space-x-4">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=0374B5&color=fff`}
                    alt={user?.email || 'User'}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.user_metadata?.full_name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-xs text-gray-500">
                      Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Account Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Understand how your data is handled and secured.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Data Security */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Encrypted Token Storage</p>
                        <p className="text-sm text-gray-600">Your Canvas API token is encrypted before storage using AES encryption.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Secure Authentication</p>
                        <p className="text-sm text-gray-600">Authentication is handled by Supabase using industry-standard OAuth 2.0.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Row Level Security</p>
                        <p className="text-sm text-gray-600">Database access is restricted so you can only see your own data.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Usage */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Usage</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Canvas Data</p>
                        <p className="text-sm text-gray-600">We only fetch assignment, grade, and course data from Canvas. No personal messages or sensitive information.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">No Third-Party Sharing</p>
                        <p className="text-sm text-gray-600">Your data is never shared with third parties or used for marketing purposes.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Local Processing</p>
                        <p className="text-sm text-gray-600">All data processing happens locally in your browser or our secure servers.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Deletion */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Deletion</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    When you remove your Canvas integration or delete your account, all associated data is permanently deleted from our systems.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
