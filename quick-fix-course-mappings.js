#!/usr/bin/env node
// Quick fix script to create the missing course_name_mappings table
// Run with: node quick-fix-course-mappings.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createCourseMappingsTable() {
  console.log('🚀 Creating course_name_mappings table...')
  
  const sql = `
    -- Create the course_name_mappings table
    CREATE TABLE IF NOT EXISTS course_name_mappings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      course_id TEXT NOT NULL,
      original_name TEXT,
      mapped_name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );

    -- Enable Row Level Security
    ALTER TABLE course_name_mappings ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    DROP POLICY IF EXISTS "Users can view their own course mappings" ON course_name_mappings;
    CREATE POLICY "Users can view their own course mappings" ON course_name_mappings
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own course mappings" ON course_name_mappings;
    CREATE POLICY "Users can insert their own course mappings" ON course_name_mappings
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own course mappings" ON course_name_mappings;
    CREATE POLICY "Users can update their own course mappings" ON course_name_mappings
      FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own course mappings" ON course_name_mappings;
    CREATE POLICY "Users can delete their own course mappings" ON course_name_mappings
      FOR DELETE USING (auth.uid() = user_id);

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_course_name_mappings_user_id ON course_name_mappings(user_id);
    CREATE INDEX IF NOT EXISTS idx_course_name_mappings_course_id ON course_name_mappings(user_id, course_id);
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error creating table:', error)
      return false
    }
    
    console.log('✅ course_name_mappings table created successfully!')
    
    // Verify the table exists
    const { data, error: verifyError } = await supabase
      .from('course_name_mappings')
      .select('count(*)')
      .limit(1)
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return false
    }
    
    console.log('✅ Table verification successful!')
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

// Run the fix
createCourseMappingsTable()
  .then(success => {
    if (success) {
      console.log('🎉 All done! Your course mapping API should work now.')
      console.log('💡 Try refreshing your application and the error should be gone.')
    } else {
      console.log('❌ Fix failed. You may need to run the SQL manually in Supabase.')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
