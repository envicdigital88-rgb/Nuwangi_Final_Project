@echo off
title Virtual Try-On Demo Launcher
echo ============================================================
echo   Virtual Try-On Platform - Campus Demo Launcher
echo ============================================================
echo.
echo Starting all 5 applications for demo...
echo.

set PATH=%USERPROFILE%\apache-maven-3.9.16\bin;%PATH%
set PYTHONUTF8=1

echo [1/5] Starting Backend (Spring Boot on port 8082)...
start "1. Backend API (8082)" cmd /k "set PATH=%USERPROFILE%\apache-maven-3.9.16\bin;%%PATH%% & mvn spring-boot:run"
timeout /t 3 /nobreak >nul

echo [2/5] Starting Customer Store (React on port 3001)...
start "2. Customer Store (3001)" cmd /k "cd customer-store && npm start"
timeout /t 3 /nobreak >nul

echo [3/5] Starting AI Core Service (Flask on port 5000)...
start "3. AI Core Service (5000)" cmd /k "set PYTHONUTF8=1 & cd ai-model & python ai_service.py"
timeout /t 2 /nobreak >nul

echo [4/5] Starting AI Training UI (Flask on port 5001)...
start "4. AI Training UI (5001)" cmd /k "set PYTHONUTF8=1 & cd ai-model & python training_ui.py"
timeout /t 2 /nobreak >nul

echo [5/5] Starting Admin Panel (React on port 3002)...
start "5. Admin Panel (3002)" cmd /k "cd frontend && npm start"

echo.
echo ============================================================
echo   ALL APPLICATIONS ARE LAUNCHING!
echo ============================================================
echo.
echo Access URLs for Demo:
echo   • Customer Store:        http://localhost:3001
echo   • Admin Panel:           http://localhost:3002
echo   • AI Training Platform:  http://localhost:5001
echo   • Backend API:           http://localhost:8082
echo   • AI Core API:           http://localhost:5000
echo.
echo Credentials for Demo:
echo   • Admin Login:           admin@example.com / admin123
echo   • Customer Login:        sarah.johnson@email.com / customer123
echo.
echo Press any key to close this launcher...
pause >nul
