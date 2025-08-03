# 🎓 Easeboard Startup Script with Professor Rating Feature

Write-Host "🎓 Starting Easeboard with Professor Rating Feature" -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "❌ Virtual environment not found. Please run:" -ForegroundColor Red
    Write-Host "   python -m venv .venv" -ForegroundColor Yellow
    Write-Host "   .venv\Scripts\activate" -ForegroundColor Yellow
    Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host "✅ Virtual environment found" -ForegroundColor Green
Write-Host ""

# Start the FastAPI backend in a new window
Write-Host "🚀 Starting FastAPI backend on port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ..\.venv\Scripts\python.exe main.py"

# Give the backend time to start
Start-Sleep -Seconds 3

Write-Host "🌐 Starting Next.js frontend on port 3000..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 After both servers start:" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   - Professor Search: http://localhost:3000/dashboard/professor" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Make sure to sign in to access the professor search feature!" -ForegroundColor Yellow
Write-Host ""

# Start the Next.js frontend
npm run dev
