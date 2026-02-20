/**
 * ============================================
 * Layer 2: Navigation — Express Server
 * ============================================
 * This is the routing/decision-making layer.
 * It connects Layer 1 (Architecture/Prompts) to Layer 3 (Tools/Ollama).
 * It does NOT contain business logic or prompt templates.
 * It routes data between SOPs and Tools in the right order.
 * ============================================
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const { healthCheck, chatStream, OLLAMA_MODEL } = require('./tools/ollama_client');
const { buildMessages } = require('./architecture/prompt_template');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// Route: Health Check
// ─────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    try {
        const status = await healthCheck();
        res.json({
            status: status.running ? 'ok' : 'error',
            ollama: status.running,
            model: OLLAMA_MODEL,
            modelAvailable: status.modelAvailable,
            availableModels: status.models,
            error: status.error || null
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Failed to connect to Ollama',
            error: error.message
        });
    }
});

// ─────────────────────────────────────────────
// Route: Chat (Streaming)
// ─────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // --- Validation (per SOP edge cases) ---
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
            error: 'Message cannot be empty',
            hint: 'Please describe a feature, scenario, or requirement to generate test cases.'
        });
    }

    try {
        // --- Layer 1: Build messages using the prompt template ---
        const messages = buildMessages(message, history || []);

        // --- Layer 3: Call Ollama via the client tool ---
        const ollamaResponse = await chatStream(messages);

        // --- Stream the response back to the UI ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const reader = ollamaResponse.body.getReader();
        const decoder = new TextDecoder();

        let fullResponse = '';

        const processStream = async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message && parsed.message.content) {
                                const content = parsed.message.content;
                                fullResponse += content;
                                // Send as SSE event
                                res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
                            }
                            if (parsed.done) {
                                res.write(`data: ${JSON.stringify({ content: '', done: true, fullResponse })}\n\n`);
                            }
                        } catch (parseErr) {
                            // Skip unparseable lines
                        }
                    }
                }
            } catch (streamError) {
                res.write(`data: ${JSON.stringify({ error: streamError.message, done: true })}\n\n`);
            } finally {
                res.end();
            }
        };

        await processStream();

    } catch (error) {
        // --- Self-healing: Clear error messages per SOP ---
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            return res.status(503).json({
                error: 'Ollama is not running',
                hint: 'Start Ollama with: ollama serve'
            });
        }
        if (error.message.includes('model')) {
            return res.status(404).json({
                error: `Model '${OLLAMA_MODEL}' not found`,
                hint: `Pull the model with: ollama pull ${OLLAMA_MODEL}`
            });
        }
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// ─────────────────────────────────────────────
// Route: Serve the Chat UI
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   🧪 Local Test Case Generator              ║');
    console.log('║   Powered by Ollama + llama3.2               ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║   🌐 UI:     http://localhost:${PORT}            ║`);
    console.log(`║   🔗 API:    http://localhost:${PORT}/api/chat   ║`);
    console.log(`║   ❤️  Health: http://localhost:${PORT}/api/health ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
});
