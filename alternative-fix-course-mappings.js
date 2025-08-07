#!/usr/bin/env node
// Alternative fix script using direct table creation
// Run with: node alternative-fix-course-mappings.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testAndCreateTable() {
  console.log('🔍 Testing if course_name_mappings table exists...')
  
  try {
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('course_name_mappings')
      .select('*')
      .limit(1)
    
    if (!error) {
      console.log('✅ Table already exists! No fix needed.')
      return true
    }
    
    if (error.code === '42P01') {
      console.log('❌ Table does not exist. Creating it...')
      console.log('')
      console.log('🔧 MANUAL FIX REQUIRED:')
      console.log('1. Open your Supabase Dashboard')
      console.log('2. Go to SQL Editor')
      console.log('3. Copy and paste this SQL:')
      console.log('')
      console.log('----------------------------------------')
      console.log(`CREATE TABLE IF NOT EXISTS course_name_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  original_name TEXT,
  mapped_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE course_name_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course mappings" ON course_name_mappings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course mappings" ON course_name_mappings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course mappings" ON course_name_mappings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course mappings" ON course_name_mappings
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_course_name_mappings_user_id ON course_name_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_course_name_mappings_course_id ON course_name_mappings(user_id, course_id);`)
      console.log('----------------------------------------')
      console.log('')
      console.log('4. Click "Run" to execute the SQL')
      console.log('5. Refresh your application')
      console.log('')
      return false
    }
    
    console.error('❌ Unexpected error:', error)
    return false
    
  } catch (error) {
    console.error('❌ Script error:', error)
    return false
  }
}

testAndCreateTable()
  .then(success => {
    if (success) {
      console.log('🎉 Table exists and is ready!')
    } else {
      console.log('⚠️  Manual intervention required - see instructions above')
    }
  })
  .catch(error => {
    console.error('❌ Script failed:', error)
  })
