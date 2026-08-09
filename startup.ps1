# Virtual Try-On Platform - Complete Startup Script
# Run with: powershell -ExecutionPolicy Bypass -File startup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Virtual Try-On Platform Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$JAVA_HOME = "C:\Program Files\Java\jdk-26.0.1"
$MAVEN_HOME = "C:\Users\User\Downloads\maven-mvnd-1.0.6-windows-amd64\maven-mvnd-1.0.6-windows-amd64"
$PYTHON_PATH = "C:\Users\User\AppData\Local\Python\pythoncore-3.14-64"

$env:JAVA_HOME = $JAVA_HOME
$env:Path = "$JAVA_HOME\bin;$MAVEN_HOME\bin;$env:Path"

# Check prerequisites
Write-Host "[1/4] Checking prerequisites..." -ForegroundColor Yellow

if (Test-Path "$JAVA_HOME\bin\java.exe") {
    Write-Host "  ✓ Java found: version 26.0.1" -ForegroundColor Green
} else {
    Write-Host "  ✗ Java not found at $JAVA_HOME" -ForegroundColor Red
    exit 1
}

if (Test-Path "$MAVEN_HOME\bin\mvnd.exe") {
    Write-Host "  ✓ Maven found" -ForegroundColor Green
} else {
    Write-Host "  ✗ Maven not found at $MAVEN_HOME" -ForegroundColor Red
    exit 1
}

if (Test-Path "$PYTHON_PATH\python.exe") {
    Write-Host "  ✓ Python found: version 3.14" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python not found at $PYTHON_PATH" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host ""
Write-Host "[2/4] Installing Python dependencies..." -ForegroundColor Yellow
& "$PYTHON_PATH\python.exe" -m pip install -q flask flask-cors numpy pillow opencv-python mediapipe scikit-learn 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠ Warning: Some Python dependencies may not have installed" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
}

# Start services
Write-Host ""
Write-Host "[3/4] Starting services..." -ForegroundColor Yellow
Write-Host ""

# Change to project directory
$projectDir = Get-Location

# Start Backend
Write-Host "  → Starting Backend (Spring Boot) on http://localhost:8082" -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `"cd '$projectDir'; & '$MAVEN_HOME\bin\mvnd.exe' spring-boot:run`"" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "  → Starting Frontend (React) on http://localhost:3001" -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `"cd '$projectDir\customer-store'; npm start`"" -WindowStyle Normal

# Wait a bit for frontend to start
Start-Sleep -Seconds 3

# Start AI Service
Write-Host "  → Starting AI Service (Flask) on http://localhost:5000" -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `"cd '$projectDir\ai-model'; & '$PYTHON_PATH\python.exe' ai_service.py`"" -WindowStyle Normal

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All applications are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor Cyan
Write-Host "  • Frontend:    http://localhost:3001" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:8082" -ForegroundColor White
Write-Host "  • AI Service:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Three PowerShell windows have been opened:" -ForegroundColor Cyan
Write-Host "  1. Backend - Spring Boot (port 8082)" -ForegroundColor White
Write-Host "  2. Frontend - React (port 3001)" -ForegroundColor White
Write-Host "  3. AI Service - Flask (port 5000)" -ForegroundColor White
Write-Host ""
Write-Host "Waiting for services to initialize (30-60 seconds)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now open your browser to: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, close the terminal windows or run:" -ForegroundColor Gray
Write-Host "  Get-Process java,node,python | Stop-Process -Force" -ForegroundColor Gray
Write-Host ""

# Keep this window open
Read-Host "Press Enter to exit this window (services will continue running)"
