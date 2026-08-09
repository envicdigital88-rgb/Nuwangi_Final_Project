@echo off
echo ============================================================
echo   AI Model Training Web Interface
echo ============================================================
echo.
echo Starting training UI on http://localhost:5001
echo.
echo Features:
echo   - Visual training interface
echo   - Real-time progress tracking
echo   - Model information dashboard
echo   - Training history viewer
echo.
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

cd /d "%~dp0"
python training_ui.py

pause
