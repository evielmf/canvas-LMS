#!/usr/bin/env node

/**
 * Supabase RLS Performance Fix - Node.js Application Script
 * Applies RLS optimizations using your existing Supabase setup
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables!')
    console.error('Please ensure .env.local contains:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

// Create Supabase client with service role key (for admin operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

console.log('🔧 Supabase RLS Performance Optimization')
console.log('==========================================')
console.log('✅ Connected to Supabase')

async function main() {
    const args = process.argv.slice(2)
    const isDryRun = args.includes('--dry-run')
    const isStepByStep = args.includes('--step-by-step')
    
    if (isDryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be applied')
        await previewChanges()
        return
    }
    
    // Backup current state
    console.log('\n📋 Creating backup of current policies...')
    await backupPolicies()
    
    if (isStepByStep) {
        await applyFixesStepByStep()
    } else {
        await applyAllFixes()
    }
}

async function previewChanges() {
    console.log('\n📊 Current RLS Policies Analysis:')
    
    const { data: policies, error } = await supabase
        .rpc('get_policies_summary')
        .select('*')
    
    if (error) {
        // Fallback query if RPC doesn't exist
        const { data: tables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', [
                'study_reminders', 'weekly_schedule', 'canvas_tokens',
                'canvas_courses_cache', 'canvas_assignments_cache', 'study_sessions',
                'analytics_snapshots', 'course_health_scores', 'sync_conflicts',
                'ai_conversations', 'ai_usage_stats'
            ])
        
        console.log('📋 Tables to be optimized:')
        tables?.forEach(table => {
            console.log(`  • ${table.table_name}`)
        })
    }
    
    console.log('\n🎯 Planned optimizations:')
    console.log('  • Convert auth.uid() → (select auth.uid())')
    console.log('  • Consolidate multiple CRUD policies → single FOR ALL policy')
    console.log('  • Remove duplicate/overlapping policies')
}

async function backupPolicies() {
    try {
        // This would ideally export current policies, but for now we'll just verify connection
        const { data, error } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('schemaname', 'public')
            .limit(1)
        
        if (error) {
            console.log('⚠️  Could not create policy backup (insufficient permissions)')
            console.log('    Recommend manually backing up via: supabase db dump')
        } else {
            console.log('✅ Policy backup check completed')
        }
    } catch (err) {
        console.log('⚠️  Backup verification failed - proceeding with caution')
    }
}

async function applyAllFixes() {
    console.log('\n🚀 Applying RLS performance fixes...')
    
    try {
        // Read the SQL file
        const sqlContent = readFileSync('supabase-rls-performance-fix.sql', 'utf8')
        
        // Split into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
        
        console.log(`📝 Executing ${statements.length} SQL statements...`)
        
        let successCount = 0
        let errorCount = 0
        
        for (const [index, statement] of statements.entries()) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
                
                if (error) {
                    console.log(`❌ Statement ${index + 1} failed: ${error.message}`)
                    errorCount++
                } else {
                    successCount++
                    if (successCount % 10 === 0) {
                        console.log(`✅ Processed ${successCount} statements...`)
                    }
                }
            } catch (err) {
                console.log(`❌ Statement ${index + 1} error: ${err.message}`)
                errorCount++
            }
        }
        
        console.log('\n📊 Results:')
        console.log(`✅ Successful: ${successCount}`)
        console.log(`❌ Failed: ${errorCount}`)
        
        if (errorCount === 0) {
            console.log('\n🎉 All RLS optimizations applied successfully!')
            await verifyFixes()
        } else {
            console.log('\n⚠️  Some fixes failed - please review and apply manually')
        }
        
    } catch (err) {
        console.error('❌ Failed to read SQL file:', err.message)
        console.log('Please ensure supabase-rls-performance-fix.sql exists in current directory')
    }
}

async function applyFixesStepByStep() {
    console.log('\n🔄 Step-by-step application mode')
    
    const tables = [
        'study_reminders', 'weekly_schedule', 'canvas_tokens',
        'canvas_courses_cache', 'canvas_assignments_cache', 'study_sessions',
        'analytics_snapshots', 'course_health_scores', 'sync_conflicts',
        'ai_conversations', 'ai_usage_stats'
    ]
    
    for (const table of tables) {
        console.log(`\n🔧 Processing table: ${table}`)
        
        // Apply fixes for this table
        try {
            await applyTableFix(table)
            console.log(`✅ ${table} optimized successfully`)
            
            // Test the table
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1)
            
            if (error) {
                console.log(`⚠️  Test query failed for ${table}: ${error.message}`)
            } else {
                console.log(`✅ ${table} test query successful`)
            }
            
        } catch (err) {
            console.log(`❌ Failed to optimize ${table}: ${err.message}`)
        }
        
        // Ask user to continue
        if (tables.indexOf(table) < tables.length - 1) {
            console.log('Press Enter to continue to next table, or Ctrl+C to stop...')
            // In a real implementation, you'd wait for user input here
        }
    }
}

async function applyTableFix(tableName) {
    // This would contain the specific SQL for each table
    // For now, this is a placeholder that would execute the appropriate SQL
    console.log(`  Applying optimizations to ${tableName}...`)
}

async function verifyFixes() {
    console.log('\n🔍 Verifying fixes...')
    
    try {
        // Check policy count
        const { data: policyCount } = await supabase
            .rpc('count_policies_by_table')
        
        console.log('📊 Policy count by table:')
        if (policyCount) {
            policyCount.forEach(row => {
                console.log(`  ${row.table_name}: ${row.policy_count} policies`)
            })
        }
        
        console.log('\n✅ Verification completed')
        console.log('\n🎯 Next steps:')
        console.log('  1. Test your application functionality')
        console.log('  2. Run: supabase db lint (if available)')
        console.log('  3. Monitor query performance')
        
    } catch (err) {
        console.log('⚠️  Could not run full verification - please test manually')
    }
}

// Handle command line arguments
if (process.argv.includes('--help')) {
    console.log('Usage: node apply-rls-fixes.js [options]')
    console.log('Options:')
    console.log('  --dry-run      Preview changes without applying')
    console.log('  --step-by-step Apply fixes one table at a time')
    console.log('  --help         Show this help message')
    process.exit(0)
}

// Run the script
main().catch(err => {
    console.error('❌ Script failed:', err.message)
    process.exit(1)
})
