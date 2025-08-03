@echo off
echo 🎓 Starting Easeboard with Professor Rating Feature
echo.
echo 🔧 Setting up environment...

REM Check if virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo ❌ Virtual environment not found. Please run:
    echo    python -m venv .venv
    echo    .venv\Scripts\activate
    echo    pip install -r requirements.txt
    pause
    exit /b 1
)

echo ✅ Virtual environment found
echo.

REM Start the FastAPI backend in a new window
echo 🚀 Starting FastAPI backend on port 8000...
start "Easeboard Backend" cmd /k "cd backend && ..\\.venv\\Scripts\\python.exe main.py"

REM Give the backend time to start
timeout /t 3 /nobreak >nul

echo 🌐 Starting Next.js frontend on port 3000...
echo.
echo 📋 After both servers start:
echo    - Frontend: http://localhost:3000
echo    - Backend:  http://localhost:8000
echo    - Professor Search: http://localhost:3000/dashboard/professor
echo.
echo ⚠️  Make sure to sign in to access the professor search feature!
echo.

REM Start the Next.js frontend
npm run dev
