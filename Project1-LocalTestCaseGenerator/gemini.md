# Project Constitution (gemini.md)
# 🔒 LOCKED — Data-First Rule: Schema confirmed. Coding may begin.

## Identity
- **Project:** Local LLM Test Case Generator
- **Model:** llama3.2 (via Ollama)
- **Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)
- **Architecture:** A.N.T. (Agent → Network → Tools)

---

## North Star
> Given any user-described feature, scenario, or requirement, generate comprehensive, 
> well-structured test cases automatically using a local LLM (llama3.2 via Ollama), 
> with zero cloud dependency, through a beautiful chat UI.

---

## Data Schemas

### INPUT Schema (User → System)
```json
{
  "userMessage": "string — The user's description of a feature/scenario to test",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ]
}
```

### INTERNAL Schema (System → Ollama API)
```json
{
  "model": "llama3.2",
  "messages": [
    {
      "role": "system",
      "content": "string — The test case generation prompt template (stored in code)"
    },
    {
      "role": "user",
      "content": "string — The user's input"
    }
  ],
  "stream": true
}
```

### OUTPUT Schema (System → User)
```json
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "string — Short descriptive title",
      "description": "string — What this test verifies",
      "preconditions": "string — Setup requirements",
      "steps": ["string — Step 1", "string — Step 2"],
      "expectedResult": "string — What should happen",
      "priority": "High | Medium | Low",
      "type": "Positive | Negative | Edge Case"
    }
  ],
  "summary": "string — Brief overview of generated test coverage",
  "rawMarkdown": "string — The full LLM response in markdown"
}
```

### Ollama API Contract
- **Endpoint:** `POST http://localhost:11434/api/chat`
- **Streaming:** Enabled by default (stream: true)
- **Non-streaming:** Set `stream: false` to get a single response object
- **Response shape (non-streaming):**
```json
{
  "model": "llama3.2",
  "message": {
    "role": "assistant",
    "content": "string — The generated test cases"
  },
  "done": true,
  "total_duration": 123456789
}
```

---

## Prompt Template (Stored in Code)
The system prompt will instruct the LLM to:
1. Analyze the user's input (feature, scenario, or requirement)
2. Generate structured test cases with: ID, Title, Description, Preconditions, Steps, Expected Result, Priority, Type
3. Cover Positive, Negative, and Edge Case scenarios
4. Output in a clean, readable markdown table or structured format
5. Include a summary of test coverage

---

## Behavioral Rules
1. **Reliability over Speed** — Prioritize correct, complete test cases over fast generation
2. **Never Guess Business Logic** — If the user's input is ambiguous, ask clarifying questions
3. **Deterministic Template** — The system prompt is hardcoded; the LLM only varies based on user input
4. **No Cloud Dependency** — Everything runs locally via Ollama
5. **Conversational** — The UI supports back-and-forth chat for refining test cases
6. **Structured Output** — Always attempt to output test cases in the defined schema format

---

## Architectural Invariants
1. **A.N.T. Layer Isolation:**
   - **Layer 1 (Agent/Logic):** Prompt template management, conversation orchestration
   - **Layer 2 (Network/Services):** Ollama API communication, HTTP requests
   - **Layer 3 (Tools/UI):** Chat web interface, user input/output
2. **Layer 1 must NOT directly call Ollama** — it must go through Layer 2
3. **The prompt template lives in Layer 1** — not hardcoded in the UI or API layer
4. **Streaming responses** are displayed in real-time in the chat UI
5. **Error handling** — If Ollama is unreachable, display a clear error message (self-healing)

---

## Tech Stack
- **Frontend:** HTML + CSS + Vanilla JavaScript (Chat UI)
- **Backend:** Node.js (Express) — thin server to proxy Ollama API
- **LLM:** Ollama API (localhost:11434) with llama3.2
- **No external dependencies** beyond Ollama
---

## 🛠️ Maintenance Log (Phase 5)
| Version | Date | Change | Reason |
|---------|------|--------|--------|
| v1.0.0 | 2026-02-19 | Initial Release | Base feature complete (A.N.T. architecture) |
| v1.0.1 | 2026-02-19 | Python Pivot | Switched from Node to Python for zero-dependency local execution |

## 🛰️ Deployment Guide
### Local Deployment (Standard)
1. Ensure Ollama is running (`ollama serve`).
2. Pull required model: `ollama pull llama3.2`.
3. Run `./start.sh` to launch the server and UI.

### Cloud / Container Deployment
1. Use the provided `Dockerfile`.
2. Map port 3000 to your host.
3. Ensure the container has network access to an Ollama instance (local or remote).

---

## 🚦 Future Triggers (Automation)
- **Webhooks:** The `/api/chat` endpoint is ready for integration with CI/CD pipelines.
- **Cron:** Test case generation can be scheduled via `start.sh` and CLI headers.

---

## ⚖️ Maintenance Rule
- **Every 3 months:** Verify `llama3.2` performance against newer model variants from Ollama.
- **Security:** Ensure no local data is leaked via environment variables.
