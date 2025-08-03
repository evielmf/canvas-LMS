import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Query the information schema to see actual table structure
    const { data: assignmentsColumns, error: assignmentsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'canvas_assignments_cache' 
          ORDER BY ordinal_position
        `
      })
    
    const { data: coursesColumns, error: coursesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'canvas_courses_cache' 
          ORDER BY ordinal_position
        `
      })

    return NextResponse.json({
      assignments_table: {
        columns: assignmentsColumns,
        error: assignmentsError
      },
      courses_table: {
        columns: coursesColumns,
        error: coursesError
      }
    })

  } catch (error) {
    console.error('Schema debug error:', error)
    return NextResponse.json({ error: 'Failed to fetch schema info' }, { status: 500 })
  }
}
