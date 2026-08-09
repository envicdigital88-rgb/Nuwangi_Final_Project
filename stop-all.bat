@echo off
echo ========================================
echo  Stopping All Applications
echo ========================================
echo.

echo Stopping Backend (Spring Boot)...
taskkill /FI "WindowTitle eq Backend - Spring Boot*" /T /F 2>nul

echo Stopping Frontend (React)...
taskkill /FI "WindowTitle eq Frontend - React*" /T /F 2>nul

echo Stopping AI Service (Flask)...
taskkill /FI "WindowTitle eq AI Service - Flask*" /T /F 2>nul

echo.
echo Stopping Node.js processes...
taskkill /IM node.exe /F 2>nul

echo Stopping Java processes (Maven)...
taskkill /IM java.exe /F 2>nul

echo Stopping Python processes...
taskkill /IM python.exe /F 2>nul

echo.
echo ========================================
echo  All applications stopped!
echo ========================================
echo.
pause
