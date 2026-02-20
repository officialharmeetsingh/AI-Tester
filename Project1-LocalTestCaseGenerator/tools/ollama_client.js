/**
 * ============================================
 * Layer 3: Tools — Ollama Client
 * ============================================
 * Deterministic wrapper for Ollama API communication.
 * This module handles ONLY the HTTP transport layer.
 * It does NOT contain business logic or prompt templates.
 * ============================================
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const REQUEST_TIMEOUT = 120000; // 120 seconds

/**
 * Check if Ollama is running and the model is available.
 * @returns {Promise<{running: boolean, modelAvailable: boolean, models: string[]}>}
 */
async function healthCheck() {
    try {
        // Check if Ollama is running
        const healthRes = await fetch(`${OLLAMA_BASE_URL}/`, {
            signal: AbortSignal.timeout(5000)
        });
        const healthText = await healthRes.text();
        const running = healthText.includes('Ollama is running');

        // Check available models
        const tagsRes = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000)
        });
        const tagsData = await tagsRes.json();
        const models = (tagsData.models || []).map(m => m.name);
        const modelAvailable = models.some(m => m.startsWith(OLLAMA_MODEL));

        return { running, modelAvailable, models };
    } catch (error) {
        return { running: false, modelAvailable: false, models: [], error: error.message };
    }
}

/**
 * Send a chat request to Ollama and stream the response.
 * @param {Array<{role: string, content: string}>} messages - The messages array
 * @param {Function} onChunk - Callback for each streamed chunk (receives text string)
 * @param {Function} onDone - Callback when streaming is complete
 * @param {Function} onError - Callback on error
 * @returns {Promise<string>} The full response text
 */
async function chatStream(messages, onChunk, onDone, onError) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: messages,
                stream: true
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API error (${response.status}): ${errorText}`);
        }

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 120 seconds. The model may be overloaded.');
        }
        throw error;
    }
}

/**
 * Send a non-streaming chat request to Ollama.
 * @param {Array<{role: string, content: string}>} messages - The messages array
 * @returns {Promise<{content: string, model: string, totalDuration: number}>}
 */
async function chatSync(messages) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: messages,
            stream: false
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
        content: data.message?.content || '',
        model: data.model,
        totalDuration: data.total_duration
    };
}

module.exports = { healthCheck, chatStream, chatSync, OLLAMA_MODEL, OLLAMA_BASE_URL };
