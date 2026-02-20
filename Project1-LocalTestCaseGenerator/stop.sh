#!/bin/bash
# ============================================
# 🛑 TestCase AI — Stop Script
# ============================================
# Cleanly stops the TestCase AI server.
# ============================================

PORT="${PORT:-3000}"

echo "🛑 Stopping TestCase AI..."

# Kill any process on the port
PIDS=$(lsof -ti:$PORT 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null
    echo "  ✅ Server stopped (killed PID: $PIDS)"
else
    echo "  ℹ️  No server running on port $PORT"
fi
