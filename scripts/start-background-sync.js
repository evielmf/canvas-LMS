#!/usr/bin/env node
/**
 * Canvas LMS Dashboard - Background Sync Initializer
 * Sets up automatic Canvas data synchronization
 */

console.log('🚀 Canvas LMS Dashboard - Background Sync')
console.log('========================================')
console.log('')

// Check environment
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production mode detected - Auto-sync will start automatically via Next.js')
  console.log('💡 Background sync is handled by the Next.js application in production')
} else {
  console.log('🔧 Development mode - Background sync available via API endpoints')
  console.log('')
  console.log('Available endpoints:')
  console.log('  POST /api/canvas/auto-sync  - Trigger manual sync')
  console.log('  GET  /api/canvas/auto-sync  - Check sync status')
  console.log('')
  console.log('Frontend integration:')
  console.log('  - SyncStatusWidget component shows real-time status')
  console.log('  - useCanvasSync hook provides sync controls')
  console.log('  - Auto-sync triggers when data is stale')
  console.log('')
  
  // Simple manual controls for development
  console.log('Manual testing:')
  console.log('  [t] Test sync status endpoint')
  console.log('  [s] Trigger manual sync')
  console.log('  [q] Quit')
  console.log('')
  
  // Setup readline for manual control
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.on('line', async (input) => {
    const command = input.trim().toLowerCase()
    
    try {
      switch (command) {
        case 't':
          console.log('� Testing sync status endpoint...')
          const { default: fetch } = await import('node-fetch')
          const statusResponse = await fetch('http://localhost:3000/api/canvas/auto-sync')
          if (statusResponse.ok) {
            const status = await statusResponse.json()
            console.log('✅ Status:', JSON.stringify(status, null, 2))
          } else {
            console.log('❌ Status check failed:', statusResponse.status)
          }
          break
          
        case 's':
          console.log('🔄 Triggering manual sync...')
          const { default: fetch2 } = await import('node-fetch')
          const syncResponse = await fetch2('http://localhost:3000/api/canvas/auto-sync', {
            method: 'POST'
          })
          if (syncResponse.ok) {
            const result = await syncResponse.json()
            console.log('✅ Sync completed:', JSON.stringify(result.stats, null, 2))
          } else {
            console.log('❌ Sync failed:', syncResponse.status)
          }
          break
          
        case 'q':
          console.log('👋 Exiting...')
          process.exit(0)
          break
          
        default:
          console.log('❓ Unknown command. Use t/s/q')
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
    }
  })
  
  console.log('� Make sure your Next.js dev server is running on http://localhost:3000')
}
