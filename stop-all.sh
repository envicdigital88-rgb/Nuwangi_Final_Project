#!/bin/bash

echo "========================================"
echo " Stopping All Applications"
echo "========================================"
echo ""

echo "Stopping Backend (Spring Boot)..."
pkill -f "spring-boot:run" 2>/dev/null

echo "Stopping Frontend (React)..."
pkill -f "react-scripts" 2>/dev/null

echo "Stopping AI Service (Flask)..."
pkill -f "ai_service.py" 2>/dev/null

echo "Stopping Node.js processes..."
pkill -f "node.*customer-store" 2>/dev/null

echo ""
echo "========================================"
echo " All applications stopped!"
echo "========================================"
echo ""
