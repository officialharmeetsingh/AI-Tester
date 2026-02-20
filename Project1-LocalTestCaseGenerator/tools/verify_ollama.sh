#!/bin/bash
# =============================================
# Phase 2: Link — Ollama Handshake Verification
# =============================================
# This script verifies that:
# 1. Ollama is running
# 2. The required model (llama3.2) is available
# 3. The /api/chat endpoint responds correctly
# =============================================

OLLAMA_BASE="http://localhost:11434"
REQUIRED_MODEL="llama3.2"

echo "============================================="
echo "🔗 Phase 2: Ollama Handshake Verification"
echo "============================================="
echo ""

# --- Test 1: Is Ollama running? ---
echo "🧪 Test 1: Checking if Ollama is running..."
HEALTH_RESPONSE=$(curl -s "$OLLAMA_BASE/" 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "Ollama is running" ]; then
    echo "   ✅ Ollama is running at $OLLAMA_BASE"
else
    echo "   ❌ FAILED: Ollama is not running at $OLLAMA_BASE"
    echo "   💡 Fix: Run 'ollama serve' or start the Ollama app"
    exit 1
fi
echo ""

# --- Test 2: Is the required model available? ---
echo "🧪 Test 2: Checking if model '$REQUIRED_MODEL' is available..."
MODEL_LIST=$(ollama list 2>/dev/null)
if echo "$MODEL_LIST" | grep -q "$REQUIRED_MODEL"; then
    echo "   ✅ Model '$REQUIRED_MODEL' is available"
else
    echo "   ❌ FAILED: Model '$REQUIRED_MODEL' is not installed"
    echo "   💡 Fix: Run 'ollama pull $REQUIRED_MODEL'"
    echo "   📋 Available models:"
    echo "$MODEL_LIST" | sed 's/^/      /'
    exit 1
fi
echo ""

# --- Test 3: Can we chat with the model? ---
echo "🧪 Test 3: Testing /api/chat endpoint with a simple prompt..."
CHAT_RESPONSE=$(curl -s "$OLLAMA_BASE/api/chat" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$REQUIRED_MODEL\",
        \"messages\": [{\"role\": \"user\", \"content\": \"Say hello in exactly 3 words.\"}],
        \"stream\": false
    }" 2>/dev/null)

if echo "$CHAT_RESPONSE" | grep -q '"done":true'; then
    echo "   ✅ /api/chat endpoint is responding correctly"
    # Extract the assistant's message content
    ASSISTANT_MSG=$(echo "$CHAT_RESPONSE" | grep -o '"content":"[^"]*"' | head -1 | sed 's/"content":"//;s/"$//')
    echo "   📝 LLM Response: $ASSISTANT_MSG"
else
    echo "   ❌ FAILED: /api/chat endpoint did not return expected response"
    echo "   📋 Raw response: $CHAT_RESPONSE"
    exit 1
fi
echo ""

echo "============================================="
echo "✅ ALL HANDSHAKE TESTS PASSED"
echo "   Ollama is ready for Test Case Generation!"
echo "============================================="
exit 0
