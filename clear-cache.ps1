#!/usr/bin/env pwsh

# Clear Cache Script for Easeboard Canvas LMS Dashboard
# This script clears various caches that can cause ChunkLoadError

Write-Host "🧹 Clearing Easeboard caches..." -ForegroundColor Cyan

# Clear Next.js build cache
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

# Clear node_modules/.cache if it exists
if (Test-Path "node_modules/.cache") {
    Write-Host "Removing node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
}

# Clear PWA cache files (but keep the source files)
$cacheFiles = @("public/sw.js", "public/workbox-*.js")
foreach ($pattern in $cacheFiles) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "Removing PWA cache file: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Cache clearing complete!" -ForegroundColor Green
Write-Host "🚀 Now run: npm run dev" -ForegroundColor Cyan
