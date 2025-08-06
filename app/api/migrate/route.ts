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

    // Create sync_conflicts table if it doesn't exist
    console.log('📝 Creating sync_conflicts table...')
    const syncConflictsTable = `
      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        item_type TEXT NOT NULL CHECK (item_type IN ('assignment', 'course', 'grade')),
        item_id TEXT NOT NULL,
        field TEXT NOT NULL,
        cached_value JSONB,
        live_value JSONB,
        status TEXT DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'ignored')),
        detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: syncConflictsTable })
    if (tableError) console.warn('Table creation warning:', tableError.message)

    // Enable RLS on sync_conflicts
    console.log('📝 Setting up RLS for sync_conflicts...')
    const rlsSql = `
      ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view their own sync conflicts" ON sync_conflicts;
      CREATE POLICY "Users can view their own sync conflicts" ON sync_conflicts
        FOR SELECT USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can insert their own sync conflicts" ON sync_conflicts;  
      CREATE POLICY "Users can insert their own sync conflicts" ON sync_conflicts
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can update their own sync conflicts" ON sync_conflicts;
      CREATE POLICY "Users can update their own sync conflicts" ON sync_conflicts
        FOR UPDATE USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can delete their own sync conflicts" ON sync_conflicts;
      CREATE POLICY "Users can delete their own sync conflicts" ON sync_conflicts
        FOR DELETE USING (auth.uid() = user_id);
    `
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSql })
    if (rlsError) console.warn('RLS setup warning:', rlsError.message)

    // Create indexes for sync_conflicts
    console.log('📝 Creating indexes for sync_conflicts...')
    const indexesSql = `
      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_user_id ON sync_conflicts(user_id);
      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status);
      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_item_type ON sync_conflicts(item_type);
      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_detected_at ON sync_conflicts(detected_at);
    `
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSql })
    if (indexError) console.warn('Index creation warning:', indexError.message)

    // Create update trigger for sync_conflicts
    console.log('📝 Creating update trigger for sync_conflicts...')
    const triggerSql = `
      CREATE OR REPLACE FUNCTION update_sync_conflicts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_sync_conflicts_updated_at ON sync_conflicts;
      CREATE TRIGGER update_sync_conflicts_updated_at
        BEFORE UPDATE ON sync_conflicts
        FOR EACH ROW
        EXECUTE FUNCTION update_sync_conflicts_updated_at();
    `
    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSql })
    if (triggerError) console.warn('Trigger creation warning:', triggerError.message)

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
