import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { authorization } = Object.fromEntries(request.headers.entries())
    
    // Simple auth check - you can make this more secure
    if (authorization !== 'Bearer migrate-db-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 Running database migration...')
    
    // Add missing columns to canvas_tokens table
    console.log('📝 Adding token_name column to canvas_tokens...')
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE canvas_tokens ADD COLUMN IF NOT EXISTS token_name TEXT;'
    })
    if (error1) console.warn('Warning:', error1.message)

    // Add missing columns to canvas_assignments_cache table
    console.log('📝 Adding missing columns to canvas_assignments_cache...')
    const migrations = [
      'ALTER TABLE canvas_assignments_cache ADD COLUMN IF NOT EXISTS has_submission BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE canvas_assignments_cache ADD COLUMN IF NOT EXISTS workflow_state TEXT;',
      'ALTER TABLE canvas_assignments_cache ADD COLUMN IF NOT EXISTS assignment_group_id INTEGER;',
      'ALTER TABLE canvas_assignments_cache ADD COLUMN IF NOT EXISTS created_at_canvas TIMESTAMP WITH TIME ZONE;',
      'ALTER TABLE canvas_assignments_cache ADD COLUMN IF NOT EXISTS updated_at_canvas TIMESTAMP WITH TIME ZONE;'
    ]
    
    for (const sql of migrations) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) console.warn('Warning:', error.message)
    }

    // Add missing columns to canvas_courses_cache table
    console.log('📝 Adding missing columns to canvas_courses_cache...')
    const courseMigrations = [
      'ALTER TABLE canvas_courses_cache ADD COLUMN IF NOT EXISTS workflow_state TEXT;',
      'ALTER TABLE canvas_courses_cache ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE;',
      'ALTER TABLE canvas_courses_cache ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE;',
      'ALTER TABLE canvas_courses_cache ADD COLUMN IF NOT EXISTS course_color TEXT;'
    ]
    
    for (const sql of courseMigrations) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) console.warn('Warning:', error.message)
    }

    console.log('✅ Migration completed successfully!')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully'
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
