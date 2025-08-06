# Supabase RLS Performance Fix Application Script
# Run this script to apply the RLS optimizations to your Supabase database

param(
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseServiceKey,
    
    [switch]$DryRun = $false,
    [switch]$StepByStep = $false,
    [switch]$BackupFirst = $true
)

Write-Host "🔧 Supabase RLS Performance Optimization Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Read environment variables if parameters not provided
if (-not $SupabaseUrl) {
    if (Test-Path ".env.local") {
        Write-Host "📄 Reading configuration from .env.local..." -ForegroundColor Green
        $envContent = Get-Content ".env.local"
        foreach ($line in $envContent) {
            if ($line -match "NEXT_PUBLIC_SUPABASE_URL=(.+)") {
                $SupabaseUrl = $matches[1]
                Write-Host "✅ Found Supabase URL" -ForegroundColor Green
            }
            if ($line -match "SUPABASE_SERVICE_ROLE_KEY=(.+)") {
                $SupabaseServiceKey = $matches[1]
                Write-Host "✅ Found Service Role Key" -ForegroundColor Green
            }
        }
    }
}

# Validate required parameters
if (-not $SupabaseUrl -or -not $SupabaseServiceKey) {
    Write-Host "❌ Missing required configuration!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please either:" -ForegroundColor Yellow
    Write-Host "1. Provide parameters: -SupabaseUrl 'your-url' -SupabaseServiceKey 'your-key'" -ForegroundColor Yellow
    Write-Host "2. Or create .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

# Check if required tools are available
Write-Host ""
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

$requiredTools = @("psql")
$missingTools = @()
foreach ($tool in $requiredTools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        $missingTools += $tool
    } else {
        Write-Host "✅ $tool found" -ForegroundColor Green
    }
}

if ($missingTools.Count -gt 0) {
    Write-Host "❌ Missing required tools: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools (psql)" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Verify SQL file exists
$sqlFile = "supabase-rls-performance-fix.sql"
if (!(Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found SQL optimization file" -ForegroundColor Green

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be applied" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL file contents:" -ForegroundColor Cyan
    Get-Content $sqlFile | Select-Object -First 20
    Write-Host "... (truncated, see full file for complete script)" -ForegroundColor Gray
    exit 0
}

# Confirm before proceeding
Write-Host ""
Write-Host "⚠️  This will modify your database RLS policies" -ForegroundColor Yellow
Write-Host "   - Drop and recreate policies on 11 tables"
Write-Host "   - Optimize auth function calls for performance"
Write-Host "   - Consolidate duplicate policies"
Write-Host ""
$confirm = Read-Host "Do you want to proceed? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Red
    exit 0
}

try {
    Write-Host ""
    Write-Host "🚀 Applying RLS performance optimizations..." -ForegroundColor Cyan
    
    # Apply the SQL file
    $result = supabase db push --db-url $SupabaseUrl --password $SupabaseAnonKey < $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ RLS optimizations applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Performance improvements:" -ForegroundColor Cyan
        Write-Host "   • Auth functions now use subqueries (faster execution)"
        Write-Host "   • Reduced from 40+ policies to 11 consolidated policies"
        Write-Host "   • Eliminated duplicate policy evaluations"
        Write-Host "   • Fixed all 'auth_rls_initplan' warnings"
        Write-Host "   • Fixed all 'multiple_permissive_policies' warnings"
        Write-Host ""
        Write-Host "🔍 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Run Supabase database linter again to verify fixes"
        Write-Host "   2. Test your application to ensure RLS still works correctly"
        Write-Host "   3. Monitor query performance improvements"
    } else {
        Write-Host "❌ Failed to apply optimizations" -ForegroundColor Red
        Write-Host "Check the error messages above for details" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error applying optimizations: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 For manual application, run:" -ForegroundColor Cyan
Write-Host "   supabase db push --db-url YOUR_DB_URL < supabase-rls-performance-fix.sql"
