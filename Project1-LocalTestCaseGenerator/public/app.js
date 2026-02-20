/**
 * ============================================
 * Layer 3: Tools — Chat UI Application Logic
 * ============================================
 * Handles user interaction, streaming display,
 * and conversation state management.
 * ============================================
 */

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const state = {
    conversationHistory: [],
    isStreaming: false,
    currentChatId: null,
    chats: {} // { id: { title, messages } }
};

// ─────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesList = document.getElementById('messagesList');
const messagesContainer = document.getElementById('messagesContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const charCount = document.getElementById('charCount');
const statusIndicator = document.getElementById('statusIndicator');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// ─────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkOllamaHealth();
    setupEventListeners();
    setupAutoResize();
    // Check health every 30 seconds
    setInterval(checkOllamaHealth, 30000);
});

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
async function checkOllamaHealth() {
    const dot = statusIndicator.querySelector('.status-dot');
    const text = statusIndicator.querySelector('.status-text');

    try {
        const res = await fetch('/api/health');
        const data = await res.json();

        if (data.status === 'ok' && data.modelAvailable) {
            dot.className = 'status-dot online';
            text.textContent = 'Ollama connected';
        } else if (data.status === 'ok' && !data.modelAvailable) {
            dot.className = 'status-dot offline';
            text.textContent = 'Model not found';
            showError(`Model '${data.model}' is not installed. Run: ollama pull ${data.model}`);
        } else {
            dot.className = 'status-dot offline';
            text.textContent = 'Ollama offline';
        }
    } catch {
        dot.className = 'status-dot offline';
        text.textContent = 'Server offline';
    }
}

// ─────────────────────────────────────────────
// Event Listeners
// ─────────────────────────────────────────────
function setupEventListeners() {
    // Send on button click
    sendBtn.addEventListener('click', handleSend);

    // Send on Enter (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Character counter
    messageInput.addEventListener('input', () => {
        const len = messageInput.value.length;
        charCount.textContent = `${len} / 4000`;
        sendBtn.disabled = len === 0 || state.isStreaming;
    });

    // Example prompts
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            messageInput.value = prompt;
            messageInput.dispatchEvent(new Event('input'));
            resizeTextarea();
            handleSend();
        });
    });

    // New chat
    newChatBtn.addEventListener('click', startNewChat);

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ─────────────────────────────────────────────
// Auto-resize Textarea
// ─────────────────────────────────────────────
function setupAutoResize() {
    messageInput.addEventListener('input', resizeTextarea);
}

function resizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
}

// ─────────────────────────────────────────────
// Send Message
// ─────────────────────────────────────────────
async function handleSend() {
    const message = messageInput.value.trim();
    if (!message || state.isStreaming) return;

    // Hide welcome screen
    welcomeScreen.style.display = 'none';

    // Add user message to UI
    addMessageToUI('user', message);

    // Add to history
    state.conversationHistory.push({ role: 'user', content: message });

    // Clear input
    messageInput.value = '';
    charCount.textContent = '0 / 4000';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Start streaming response
    await streamResponse(message);
}

// ─────────────────────────────────────────────
// Add Message to UI
// ─────────────────────────────────────────────
function addMessageToUI(role, content, isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.id = isStreaming ? 'streaming-message' : '';

    const avatar = role === 'user' ? '👤' : '🧪';
    const roleName = role === 'user' ? 'You' : 'TestCase AI';

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-role">${roleName}</div>
            <div class="message-body">
                ${role === 'assistant' && isStreaming
            ? `<div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                       </div>`
            : (role === 'assistant' ? renderMarkdown(content) : escapeHtml(content))
        }
                ${role === 'assistant' && !isStreaming ? '<button class="copy-btn" onclick="copyMessage(this)">Copy</button>' : ''}
            </div>
        </div>
    `;

    messagesList.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

// ─────────────────────────────────────────────
// Stream Response from Server
// ─────────────────────────────────────────────
async function streamResponse(message) {
    state.isStreaming = true;
    sendBtn.disabled = true;

    // Add streaming message placeholder
    const streamingMsg = addMessageToUI('assistant', '', true);
    const bodyEl = streamingMsg.querySelector('.message-body');

    let fullContent = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                history: state.conversationHistory.slice(0, -1) // exclude the current message (already in 'message')
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to get response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

            for (const line of lines) {
                try {
                    const data = JSON.parse(line.slice(6)); // remove 'data: '

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    if (data.content) {
                        fullContent += data.content;
                        // Re-render markdown as it streams in
                        bodyEl.innerHTML = renderMarkdown(fullContent) +
                            '<button class="copy-btn" onclick="copyMessage(this)">Copy</button>';
                        scrollToBottom();
                    }

                    if (data.done) {
                        // Streaming complete
                        state.conversationHistory.push({ role: 'assistant', content: fullContent });
                        updateChatHistory(message, fullContent);
                    }
                } catch (parseErr) {
                    if (parseErr.message && !parseErr.message.includes('JSON')) {
                        throw parseErr;
                    }
                }
            }
        }

    } catch (error) {
        bodyEl.innerHTML = `<div style="color: var(--error);">⚠️ ${escapeHtml(error.message)}</div>`;
        showError(error.message);
    } finally {
        state.isStreaming = false;
        sendBtn.disabled = messageInput.value.length === 0;
        streamingMsg.removeAttribute('id');
    }
}

// ─────────────────────────────────────────────
// Chat Management
// ─────────────────────────────────────────────
function startNewChat() {
    state.conversationHistory = [];
    messagesList.innerHTML = '';
    welcomeScreen.style.display = 'flex';
    messageInput.value = '';
    charCount.textContent = '0 / 4000';
    sendBtn.disabled = true;
    sidebar.classList.remove('open');
}

function updateChatHistory(userMsg, assistantMsg) {
    const chatId = state.currentChatId || 'chat-' + Date.now();
    state.currentChatId = chatId;

    if (!state.chats[chatId]) {
        state.chats[chatId] = {
            title: userMsg.substring(0, 50) + (userMsg.length > 50 ? '...' : ''),
            messages: []
        };
    }

    state.chats[chatId].messages.push(
        { role: 'user', content: userMsg },
        { role: 'assistant', content: assistantMsg }
    );

    renderChatHistory();
}

function renderChatHistory() {
    chatHistory.innerHTML = '';
    const chatIds = Object.keys(state.chats).reverse();

    for (const id of chatIds) {
        const chat = state.chats[id];
        const item = document.createElement('div');
        item.className = `chat-history-item ${id === state.currentChatId ? 'active' : ''}`;
        item.textContent = chat.title;
        item.addEventListener('click', () => loadChat(id));
        chatHistory.appendChild(item);
    }
}

function loadChat(chatId) {
    const chat = state.chats[chatId];
    if (!chat) return;

    state.currentChatId = chatId;
    state.conversationHistory = [...chat.messages];

    // Rebuild UI
    messagesList.innerHTML = '';
    welcomeScreen.style.display = 'none';

    for (const msg of chat.messages) {
        addMessageToUI(msg.role, msg.content);
    }

    renderChatHistory();
    sidebar.classList.remove('open');
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true
        });
        return marked.parse(text);
    }
    // Fallback: basic text with newlines
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function copyMessage(btn) {
    const body = btn.closest('.message-body');
    const text = body.innerText.replace('Copy', '').trim();

    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
}

function showError(message) {
    // Remove existing toasts
    document.querySelectorAll('.error-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `⚠️ ${escapeHtml(message)}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}
