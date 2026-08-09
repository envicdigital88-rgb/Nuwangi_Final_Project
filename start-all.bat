@echo off
echo ========================================
echo  Virtual Try-On Platform Startup
echo ========================================
echo.
echo Starting all three applications...
echo.

REM Check if required tools are installed
echo [1/3] Checking prerequisites...
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    pause
    exit /b 1
)

where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo All prerequisites found!
echo.

REM Start Backend (Spring Boot)
echo [2/3] Starting Backend (Spring Boot on port 8082)...
start "Backend - Spring Boot" cmd /k "mvn spring-boot:run"
timeout /t 3 /nobreak >nul

REM Start Frontend (React)
echo [3/3] Starting Frontend (React on port 3001)...
start "Frontend - React" cmd /k "cd customer-store && npm start"
timeout /t 3 /nobreak >nul

REM Start AI Service (Python Flask)
echo [4/3] Starting AI Service (Flask on port 5000)...
start "AI Service - Flask" cmd /k "cd ai-model && python ai_service.py"

echo.
echo ========================================
echo  All applications are starting!
echo ========================================
echo.
echo Three terminal windows have been opened:
echo   1. Backend (Spring Boot)  - http://localhost:8082
echo   2. Frontend (React)       - http://localhost:3001
echo   3. AI Service (Flask)     - http://localhost:5000
echo.
echo Wait for all services to fully start (30-60 seconds)
echo Then open your browser to: http://localhost:3001
echo.
echo Press any key to exit this window...
pause >nul
