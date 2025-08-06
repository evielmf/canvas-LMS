# Run Database Migration for Sync Conflicts

# PowerShell script to run the database migration
# This ensures the sync_conflicts table and related components are properly set up

$migrationUrl = "http://localhost:3000/api/migrate"
$authHeader = "Bearer migrate-db-2024"

Write-Host "🔄 Running database migration for Sync Conflicts..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $migrationUrl -Method POST -Headers @{
        "Authorization" = $authHeader
        "Content-Type" = "application/json"
    }
    
    if ($response.success) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host "The sync_conflicts table and related components have been set up." -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. The development server is running (npm run dev)" -ForegroundColor Yellow
    Write-Host "  2. Supabase is properly configured" -ForegroundColor Yellow
    Write-Host "  3. The SUPABASE_SERVICE_ROLE_KEY environment variable is set" -ForegroundColor Yellow
}

Write-Host "`nAfter successful migration, you can test the sync conflicts feature." -ForegroundColor Cyan
