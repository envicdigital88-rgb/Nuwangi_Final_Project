#!/bin/bash

echo "========================================"
echo " Virtual Try-On Platform Startup"
echo "========================================"
echo ""
echo "Starting all three applications..."
echo ""

# Check if required tools are installed
echo "[1/3] Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven is not installed or not in PATH"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi

if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    exit 1
fi

echo "All prerequisites found!"
echo ""

# Determine Python command
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

# Start Backend (Spring Boot)
echo "[2/3] Starting Backend (Spring Boot on port 8082)..."
gnome-terminal --title="Backend - Spring Boot" -- bash -c "mvn spring-boot:run; exec bash" 2>/dev/null || \
xterm -title "Backend - Spring Boot" -e "mvn spring-boot:run; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && mvn spring-boot:run"' 2>/dev/null &
sleep 2

# Start Frontend (React)
echo "[3/3] Starting Frontend (React on port 3001)..."
gnome-terminal --title="Frontend - React" -- bash -c "cd customer-store && npm start; exec bash" 2>/dev/null || \
xterm -title "Frontend - React" -e "cd customer-store && npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/customer-store\" && npm start"' 2>/dev/null &
sleep 2

# Start AI Service (Python Flask)
echo "[4/3] Starting AI Service (Flask on port 5000)..."
gnome-terminal --title="AI Service - Flask" -- bash -c "cd ai-model && $PYTHON_CMD ai_service.py; exec bash" 2>/dev/null || \
xterm -title "AI Service - Flask" -e "cd ai-model && $PYTHON_CMD ai_service.py; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/ai-model\" && '$PYTHON_CMD' ai_service.py"' 2>/dev/null &

echo ""
echo "========================================"
echo " All applications are starting!"
echo "========================================"
echo ""
echo "Three terminal windows have been opened:"
echo "  1. Backend (Spring Boot)  - http://localhost:8082"
echo "  2. Frontend (React)       - http://localhost:3001"
echo "  3. AI Service (Flask)     - http://localhost:5000"
echo ""
echo "Wait for all services to fully start (30-60 seconds)"
echo "Then open your browser to: http://localhost:3001"
echo ""
