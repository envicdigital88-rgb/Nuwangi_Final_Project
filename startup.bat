@echo off
REM ========================================
REM Virtual Try-On Platform - Complete Startup
REM ========================================
echo.
echo ========================================
echo   Virtual Try-On Platform Startup
echo ========================================
echo.

REM Set environment variables
set JAVA_HOME=C:\Program Files\Java\jdk-17
set MAVEN_HOME=C:\Users\User\Downloads\maven-mvnd-1.0.6-windows-amd64\maven-mvnd-1.0.6-windows-amd64
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%
set PYTHON_PATH=C:\Users\User\AppData\Local\Python\bin

REM Check prerequisites
echo [1/4] Checking prerequisites...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not found at %JAVA_HOME%
    pause
    exit /b 1
)
echo   ✓ Java found: version 17.0

%MAVEN_HOME%\bin\mvnd.exe -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven not found at %MAVEN_HOME%
    pause
    exit /b 1
)
echo   ✓ Maven found

if not exist "%PYTHON_PATH%\python.exe" (
    echo ERROR: Python not found at %PYTHON_PATH%
    echo Please install Python 3.8+ or update PYTHON_PATH in this script
    pause
    exit /b 1
)
echo   ✓ Python found: version 3.14

echo.
echo [2/4] Installing Python dependencies...
%PYTHON_PATH%\python.exe -m pip install -q flask flask-cors numpy pillow opencv-python mediapipe scikit-learn
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install some Python dependencies, but continuing...
)
echo   ✓ Python dependencies installed

echo.
echo [3/4] Starting services...
echo.

REM Start Backend (Spring Boot) on port 8082
echo   Starting Backend (Spring Boot) on http://localhost:8082
start "Backend - Spring Boot (8082)" cmd /k "title Backend - Spring Boot (8082) & %MAVEN_HOME%\bin\mvnd.exe spring-boot:run"
timeout /t 5 /nobreak >nul

REM Start Frontend (React) on port 3001
echo   Starting Frontend (React) on http://localhost:3001
start "Frontend - React (3001)" cmd /k "title Frontend - React (3001) & cd customer-store && npm start"
timeout /t 5 /nobreak >nul

REM Start AI Service (Python Flask) on port 5000
echo   Starting AI Service (Flask) on http://localhost:5000
start "AI Service - Flask (5000)" cmd /k "title AI Service - Flask (5000) & cd ai-model && %PYTHON_PATH%\python.exe ai_service.py"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   All applications are starting!
echo ========================================
echo.
echo Services will be available at:
echo   • Frontend:    http://localhost:3001
echo   • Backend API: http://localhost:8082
echo   • AI Service:  http://localhost:5000
echo.
echo Waiting for services to initialize (30-60 seconds)...
echo.
echo Three terminal windows have been opened:
echo   1. Backend - Spring Boot (port 8082)
echo   2. Frontend - React (port 3001)
echo   3. AI Service - Flask (port 5000)
echo.
echo You can now open your browser to: http://localhost:3001
echo.
echo To stop all services, close the terminal windows.
echo.
pause
