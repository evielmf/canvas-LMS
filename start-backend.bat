@echo off
title Easeboard Backend Server
echo 🚀 Starting Easeboard Backend Server...
echo 📍 Backend Directory: %CD%\backend
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Install dependencies if needed
echo Installing Python dependencies...
python -m pip install fastapi uvicorn python-dotenv

echo.
echo Starting FastAPI server on http://localhost:8000...
echo Press Ctrl+C to stop the server
echo.

REM Start the FastAPI server
python main.py

pause
