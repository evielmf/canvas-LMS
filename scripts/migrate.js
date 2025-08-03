import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🔄 Running database migration...')
  
  try {
    // Add missing columns to canvas_tokens table
    console.log('📝 Adding token_name column to canvas_tokens...')
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE canvas_tokens ADD COLUMN IF NOT EXISTS token_name TEXT;'
    })

    // Add missing columns to canvas_assignments_cache table
    console.log('📝 Adding missing columns to canvas_assignments_cache...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE canvas_assignments_cache 
        ADD COLUMN IF NOT EXISTS has_submission BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS workflow_state TEXT,
        ADD COLUMN IF NOT EXISTS assignment_group_id INTEGER,
        ADD COLUMN IF NOT EXISTS created_at_canvas TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS updated_at_canvas TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS score NUMERIC,
        ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `
    })

    // Add missing columns to canvas_courses_cache table
    console.log('📝 Adding missing columns to canvas_courses_cache...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE canvas_courses_cache 
        ADD COLUMN IF NOT EXISTS workflow_state TEXT,
        ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS course_color TEXT,
        ADD COLUMN IF NOT EXISTS canvas_course_id INTEGER;
      `
    })

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration()
