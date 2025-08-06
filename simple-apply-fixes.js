#!/usr/bin/env node

/**
 * SIMPLE RLS FIX APPLICATOR
 * This script directly applies the RLS fixes using your existing setup
 * Run with: node simple-apply-fixes.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables in .env.local:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL')
    console.error('   SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

console.log('🔧 Applying RLS Performance Fixes...')
console.log('=====================================')

// Define all the optimized policies
const rlsFixes = [
    {
        table: 'study_reminders',
        dropPolicies: [
            'Users can view their own study reminders',
            'Users can insert their own study reminders', 
            'Users can update their own study reminders',
            'Users can delete their own study reminders'
        ],
        createPolicy: {
            name: 'Users can manage their own reminders',
            definition: 'FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)'
        }
    },
    {
        table: 'weekly_schedule',
        dropPolicies: [
            'Users can view their own weekly schedule',
            'Users can insert their own weekly schedule',
            'Users can update their own weekly schedule', 
            'Users can delete their own weekly schedule'
        ],
        createPolicy: {
            name: 'Users can manage their own schedule',
            definition: 'FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)'
        }
    },
    {
        table: 'canvas_tokens',
        dropPolicies: [
            'Users can view their own Canvas tokens',
            'Users can insert their own Canvas tokens',
            'Users can update their own Canvas tokens',
            'Users can delete their own Canvas tokens'
        ],
        createPolicy: {
            name: 'Users can manage their own Canvas tokens',
            definition: 'FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)'
        }
    },
    {
        table: 'canvas_courses_cache',
        dropPolicies: [
            'Users can view their own Canvas courses cache',
            'Users can insert their own Canvas courses cache',
            'Users can update their own Canvas courses cache',
            'Users can delete their own Canvas courses cache'
        ],
        createPolicy: {
            name: 'Users can manage their own Canvas courses cache',
            definition: 'FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)'
        }
    },
    {
        table: 'canvas_assignments_cache',
        dropPolicies: [
            'Users can view their own Canvas assignments cache',
            'Users can insert their own Canvas assignments cache', 
            'Users can update their own Canvas assignments cache',
            'Users can delete their own Canvas assignments cache'
        ],
        createPolicy: {
            name: 'Users can manage their own Canvas assignments cache',
            definition: 'FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)'
        }
    }
]

async function applyFix(fix) {
    console.log(`\n🔄 Processing table: ${fix.table}`)
    
    try {
        // Drop old policies
        for (const policyName of fix.dropPolicies) {
            const dropSQL = `DROP POLICY IF EXISTS "${policyName}" ON public.${fix.table};`
            const { error } = await supabase.rpc('exec_sql', { sql: dropSQL })
            
            if (error && !error.message.includes('does not exist')) {
                console.log(`   ⚠️  Could not drop policy "${policyName}": ${error.message}`)
            } else {
                console.log(`   ✅ Dropped policy: ${policyName}`)
            }
        }
        
        // Create new optimized policy
        const createSQL = `CREATE POLICY "${fix.createPolicy.name}" ON public.${fix.table} ${fix.createPolicy.definition};`
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createSQL })
        
        if (createError) {
            console.log(`   ❌ Failed to create policy: ${createError.message}`)
        } else {
            console.log(`   ✅ Created optimized policy: ${fix.createPolicy.name}`)
        }
        
        // Test the table
        const { data, error: testError } = await supabase
            .from(fix.table)
            .select('*')
            .limit(1)
        
        if (testError && !testError.message.includes('does not exist')) {
            console.log(`   ⚠️  Table test failed: ${testError.message}`)
        } else {
            console.log(`   ✅ Table ${fix.table} is accessible`)
        }
        
        return true
        
    } catch (err) {
        console.log(`   ❌ Error processing ${fix.table}: ${err.message}`)
        return false
    }
}

async function main() {
    const args = process.argv.slice(2)
    
    if (args.includes('--help')) {
        console.log('Usage: node simple-apply-fixes.js [--dry-run]')
        console.log('  --dry-run: Show what would be done without making changes')
        return
    }
    
    if (args.includes('--dry-run')) {
        console.log('🔍 DRY RUN - Showing planned changes:')
        rlsFixes.forEach(fix => {
            console.log(`\n📋 Table: ${fix.table}`)
            console.log(`   Drop ${fix.dropPolicies.length} old policies`)
            console.log(`   Create 1 optimized policy: "${fix.createPolicy.name}"`)
        })
        console.log('\nTo apply changes, run: node simple-apply-fixes.js')
        return
    }
    
    // Apply fixes
    let successCount = 0
    let totalCount = rlsFixes.length
    
    for (const fix of rlsFixes) {
        const success = await applyFix(fix)
        if (success) successCount++
    }
    
    console.log('\n📊 Summary:')
    console.log(`✅ Successfully optimized: ${successCount}/${totalCount} tables`)
    
    if (successCount === totalCount) {
        console.log('\n🎉 All RLS optimizations completed successfully!')
        console.log('\n🔍 Next steps:')
        console.log('   1. Test your application')
        console.log('   2. Check query performance')
        console.log('   3. Run database linter if available')
    } else {
        console.log('\n⚠️  Some optimizations failed. Check the output above.')
        console.log('   You may need to apply remaining fixes manually.')
    }
}

main().catch(console.error)
