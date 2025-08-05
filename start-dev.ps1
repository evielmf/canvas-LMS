# Start development server with proper lockfile resolution
# This script ensures npm uses the project's package-lock.json

Write-Host "🚀 Starting Canvas LMS Dashboard Development Server..." -ForegroundColor Cyan
Write-Host "📍 Project Directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "📦 Using Lockfile: $(Join-Path (Get-Location) 'package-lock.json')" -ForegroundColor Yellow

# Set working directory to project root
Set-Location -Path $PSScriptRoot

# Start development server
npm run dev
