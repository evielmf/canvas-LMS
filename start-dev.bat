@echo off
title Canvas LMS Dashboard - Development Server
echo 🚀 Starting Canvas LMS Dashboard Development Server...
echo 📍 Project Directory: %CD%
echo 📦 Using Project Lockfile: %CD%\package-lock.json
echo.

REM Change to script directory
cd /d "%~dp0"

REM Start development server
npm run dev

pause
