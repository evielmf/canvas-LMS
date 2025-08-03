import { createClient } from '@/utils/supabase/api'
import crypto from 'crypto'

const decryptToken = (encryptedToken: string) => {
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'canvas-dashboard-key'
  try {
    // Parse encrypted data
    const textParts = encryptedToken.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(encryptionKey, 'salt', 32), iv)
    let decrypted = decipher.update(encryptedText, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Error decrypting token:', error)
    return null
  }
}

export interface BackgroundSyncManager {
  startAutoSync: () => void
  stopAutoSync: () => void
  syncNow: (userId: string) => Promise<boolean>
  isRunning: () => boolean
}

class CanvasBackgroundSync {
  private syncInterval: NodeJS.Timeout | null = null
  private readonly SYNC_INTERVAL = 2 * 60 * 60 * 1000 // 2 hours
  private readonly MAX_RETRIES = 3
  private isActive = false

  constructor() {
    console.log('🚀 Canvas Background Sync Manager initialized')
  }

  startAutoSync(): void {
    if (this.syncInterval) {
      console.log('⚠️ Auto-sync already running')
      return
    }

    console.log(`🔄 Starting auto-sync with ${this.SYNC_INTERVAL / 1000 / 60} minute intervals`)
    this.isActive = true

    this.syncInterval = setInterval(async () => {
      if (!this.isActive) return
      
      console.log('⏰ Running scheduled Canvas sync...')
      await this.syncAllUsers()
    }, this.SYNC_INTERVAL)

    // Run initial sync after 30 seconds
    setTimeout(() => {
      if (this.isActive) {
        console.log('🎬 Running initial Canvas sync...')
        this.syncAllUsers()
      }
    }, 30000)
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      this.isActive = false
      console.log('⏸️ Auto-sync stopped')
    }
  }

  isRunning(): boolean {
    return this.isActive && !!this.syncInterval
  }

  async syncNow(userId: string): Promise<boolean> {
    console.log(`🔄 Manual sync requested for user: ${userId}`)
    return await this.syncUserData(userId)
  }

  private async syncAllUsers(): Promise<void> {
    try {
      // Create a server-side Supabase client using environment variables
      const { createClient } = require('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing Supabase environment variables for background sync')
        return
      }
      
      const supabaseClient = createClient(supabaseUrl, serviceRoleKey)
      
      // Get all users with Canvas tokens that need syncing
      const { data: users, error } = await supabaseClient
        .from('canvas_tokens')
        .select('user_id, last_sync')
        .not('encrypted_token', 'is', null)

      if (error) {
        console.error('❌ Error fetching users for sync:', error)
        return
      }

      if (!users || users.length === 0) {
        console.log('📭 No users found with Canvas tokens')
        return
      }

      console.log(`👥 Found ${users.length} users with Canvas tokens`)

      // Filter users who need syncing (last sync > 1 hour ago or never synced)
      const now = new Date()
      const usersNeedingSync = users.filter((user: any) => {
        if (!user.last_sync) return true
        const lastSync = new Date(user.last_sync)
        const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
        return hoursSinceSync >= 1 // Sync if last sync was more than 1 hour ago
      })

      console.log(`🔄 ${usersNeedingSync.length} users need syncing`)

      // Sync users in batches to avoid overwhelming the Canvas API
      const batchSize = 3
      for (let i = 0; i < usersNeedingSync.length; i += batchSize) {
        const batch = usersNeedingSync.slice(i, i + batchSize)
        
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersNeedingSync.length / batchSize)}`)
        
        await Promise.all(
          batch.map((user: any) => this.syncUserData(user.user_id))
        )

        // Delay between batches to respect Canvas API rate limits
        if (i + batchSize < usersNeedingSync.length) {
          console.log('⏳ Waiting before next batch...')
          await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second delay
        }
      }

      console.log('✅ Batch sync completed')

    } catch (error) {
      console.error('❌ Error in syncAllUsers:', error)
    }
  }

  private async syncUserData(userId: string): Promise<boolean> {
    let retries = 0
    
    while (retries < this.MAX_RETRIES) {
      try {
        console.log(`🔄 Syncing data for user ${userId} (attempt ${retries + 1}/${this.MAX_RETRIES})`)
        
        // Call the auto-sync endpoint
        const response = await fetch('http://localhost:3000/api/canvas/auto-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Id': userId // We'll modify the auto-sync endpoint to accept this
          }
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`✅ User ${userId} sync completed:`, {
            courses: result.stats?.courses || 0,
            assignments: result.stats?.assignments || 0,
            errors: result.stats?.errors?.length || 0
          })
          return true
        } else {
          const error = await response.text()
          console.warn(`⚠️ Sync failed for user ${userId}: ${response.status} - ${error}`)
        }

      } catch (error) {
        console.error(`❌ Sync error for user ${userId}:`, error)
      }

      retries++
      if (retries < this.MAX_RETRIES) {
        const delay = Math.pow(2, retries) * 1000 // Exponential backoff
        console.log(`⏳ Retrying in ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    console.error(`❌ Failed to sync user ${userId} after ${this.MAX_RETRIES} attempts`)
    return false
  }
}

// Singleton instance
const backgroundSync = new CanvasBackgroundSync()

// Auto-start if in production
if (process.env.NODE_ENV === 'production') {
  backgroundSync.startAutoSync()
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, stopping background sync...')
    backgroundSync.stopAutoSync()
  })
  
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, stopping background sync...')
    backgroundSync.stopAutoSync()
  })
}

export default backgroundSync
