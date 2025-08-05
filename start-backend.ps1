Write-Host "🚀 Starting Easeboard Backend Server..." -ForegroundColor Green
Write-Host "📍 Backend Directory: $(Get-Location)\backend" -ForegroundColor Yellow
Write-Host ""

# Change to backend directory
Set-Location -Path "backend"

# Install dependencies if needed
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
python -m pip install fastapi uvicorn python-dotenv

Write-Host ""
Write-Host "Starting FastAPI server on http://localhost:8000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the FastAPI server
python main.py
