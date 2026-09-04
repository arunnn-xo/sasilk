@echo off
title Soil Goddess - Starting All Services
echo ===================================================
echo   Starting Soil Goddess Full Stack Application
echo ===================================================

echo [1/3] Starting Backend API (Port 5005)...
start "Soil Goddess API [5005]" cmd /k "cd /d %~dp0backend\node && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Admin Panel (Port 5173)...
start "Soil Goddess Admin [5173]" cmd /k "cd /d %~dp0backend\panel && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Frontend Storefront (Port 3000)...
start "Soil Goddess Storefront [3000]" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ===================================================
echo   All 3 services are starting!
echo   - Frontend:    http://localhost:3000
echo   - Backend API: http://localhost:5005
echo   - Admin Panel: http://localhost:5173
echo ===================================================
pause
