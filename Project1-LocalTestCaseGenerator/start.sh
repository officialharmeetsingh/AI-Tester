#!/bin/bash
# ============================================
# 🧪 TestCase AI — One-Click Launcher
# ============================================
# This script handles the full startup sequence:
# 1. Verifies Ollama is running
# 2. Ensures the required model is available
# 3. Starts the Python server
# 4. Opens the browser
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.2}"
PORT="${PORT:-3000}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🧪 TestCase AI — Local Test Case Generator ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ─── Step 1: Check Ollama ───
echo -e "${YELLOW}[1/4]${NC} Checking if Ollama is running..."
if curl -s http://localhost:11434/ | grep -q "Ollama is running"; then
    echo -e "  ${GREEN}✅ Ollama is running${NC}"
else
    echo -e "  ${YELLOW}⚠️  Ollama is not running. Starting Ollama...${NC}"
    # Try to start Ollama in background
    if command -v ollama &> /dev/null; then
        ollama serve &>/dev/null &
        sleep 3
        if curl -s http://localhost:11434/ | grep -q "Ollama is running"; then
            echo -e "  ${GREEN}✅ Ollama started successfully${NC}"
        else
            echo -e "  ${RED}❌ Failed to start Ollama. Please start it manually.${NC}"
            exit 1
        fi
    else
        echo -e "  ${RED}❌ Ollama is not installed. Install from https://ollama.ai${NC}"
        exit 1
    fi
fi

# ─── Step 2: Check Model ───
echo -e "${YELLOW}[2/4]${NC} Checking if model '${OLLAMA_MODEL}' is available..."
if ollama list 2>/dev/null | grep -q "$OLLAMA_MODEL"; then
    echo -e "  ${GREEN}✅ Model '${OLLAMA_MODEL}' is ready${NC}"
else
    echo -e "  ${YELLOW}⚠️  Model '${OLLAMA_MODEL}' not found. Pulling...${NC}"
    ollama pull "$OLLAMA_MODEL"
    echo -e "  ${GREEN}✅ Model '${OLLAMA_MODEL}' pulled successfully${NC}"
fi

# ─── Step 3: Start Server ───
echo -e "${YELLOW}[3/4]${NC} Starting TestCase AI server on port ${PORT}..."

# Kill any existing server on the port
lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

cd "$PROJECT_DIR"
python3 server.py &
SERVER_PID=$!
sleep 2

# Verify server started
if curl -s "http://localhost:${PORT}/api/health" | grep -q '"status": "ok"'; then
    echo -e "  ${GREEN}✅ Server running at http://localhost:${PORT}${NC}"
else
    echo -e "  ${RED}❌ Server failed to start${NC}"
    exit 1
fi

# ─── Step 4: Open Browser ───
echo -e "${YELLOW}[4/4]${NC} Opening browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:${PORT}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:${PORT}" 2>/dev/null || echo "  Open http://localhost:${PORT} in your browser"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ TestCase AI is ready!                    ║${NC}"
echo -e "${GREEN}║   🌐 http://localhost:${PORT}                     ║${NC}"
echo -e "${GREEN}║   Press Ctrl+C to stop                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Wait for the server process (so Ctrl+C kills it)
wait $SERVER_PID
