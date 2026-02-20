# Project Findings & Research

## Ollama Environment
- **Ollama Version:** 0.16.2
- **Location:** `/usr/local/bin/ollama`
- **API Base:** `http://localhost:11434`
- **Status:** ✅ Running
- **Available Models:** `gemma3:4b` (3.3GB)
- **Required Model:** `llama3.2` ⚠️ NOT YET PULLED — needs `ollama pull llama3.2`

## Ollama API Reference
- **Chat Endpoint:** `POST /api/chat`
- **Required Fields:** `model` (string), `messages` (array of `{role, content}`)
- **Optional Fields:** `stream` (boolean, default true), `format` (string/JSON schema), `options` (temperature etc.)
- **Roles:** `system`, `user`, `assistant`, `tool`
- **Streaming:** Returns newline-delimited JSON objects; final object has `done: true`
- **Non-Streaming:** Single JSON with full response when `stream: false`

## Architecture Decision: A.N.T. Layers
| Layer | Responsibility | Files |
|-------|---------------|-------|
| Layer 1: Agent | Prompt template, conversation logic | `prompts/`, `services/testCaseAgent.js` |
| Layer 2: Network | Ollama API communication | `services/ollamaService.js` |
| Layer 3: Tools | Chat UI, user interaction | `public/index.html`, `public/styles.css`, `public/app.js` |

## Tech Stack Decision
- **Backend:** Node.js + Express (minimal server to proxy Ollama and serve static files)
- **Frontend:** Vanilla HTML + CSS + JS (no framework needed for a chat UI)
- **Why Express?** Browser cannot directly stream from Ollama due to CORS; a thin proxy solves this cleanly
- **Why Vanilla JS?** Keeps dependencies minimal; aligns with "no cloud dependency" principle

## Research: Helpful Patterns
1. **Ollama JS Library** (`ollama` npm package) — official library for Node.js integration
2. **Streaming via EventSource/fetch** — Use `fetch` with `ReadableStream` for real-time display
3. **Markdown rendering** — Use `marked.js` for rendering LLM markdown output in the chat UI
4. **Test case prompt engineering** — System prompt should enforce structured output (table/list format)
