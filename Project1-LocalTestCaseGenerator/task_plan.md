# Task Plan: Local LLM Test Case Generator (Ollama)

## ✅ Phase 0: Initialization (COMPLETE)
- [x] Initialize Project Memory (task_plan.md, findings.md, progress.md, gemini.md)
- [x] Define Discovery Questions
- [x] Get User Answers to Discovery Questions
- [x] Define Data Schema in gemini.md (INPUT/OUTPUT JSON shapes locked)
- [x] Approve Blueprint

## ✅ Phase 1: B — Blueprint (COMPLETE)
- [x] North Star defined: Local LLM Test Case Generator with chat UI
- [x] Integrations confirmed: Ollama API (localhost:11434), llama3.2
- [x] Delivery Payload: Web Chat UI
- [x] Data Schema locked in gemini.md
- [x] Research conducted on Ollama API patterns
- [ ] Pull llama3.2 model in Ollama (if not already available)

## 🔲 Phase 2: L — Link (Connect & Validate)
- [ ] Pull llama3.2 model via `ollama pull llama3.2`
- [ ] Test raw Ollama API connectivity with curl
- [ ] Validate `/api/chat` endpoint with a test prompt
- [ ] Confirm streaming response works

## 🔲 Phase 3: A — Architect (Build the A.N.T. Layers)
### Layer 2: Network (Ollama API Service)
- [ ] Create `server.js` — Express server
- [ ] Create `services/ollamaService.js` — Ollama API wrapper
- [ ] Implement `/api/chat` proxy endpoint
- [ ] Implement streaming response forwarding

### Layer 1: Agent (Logic & Prompts)  
- [ ] Create `prompts/testCasePrompt.js` — System prompt template
- [ ] Create `services/testCaseAgent.js` — Conversation orchestration
- [ ] Implement message history management

### Layer 3: Tools (Chat UI)
- [ ] Create `public/index.html` — Chat interface
- [ ] Create `public/styles.css` — Premium dark-mode styling
- [ ] Create `public/app.js` — Frontend chat logic
- [ ] Implement streaming response display
- [ ] Implement markdown rendering for test cases

## ✅ Phase 4: S — Stylize (COMPLETE)
- [x] Dark mode with glass-morphism design
- [x] Smooth typing animations for LLM responses
- [x] Loading states and error handling UI
- [x] Responsive layout (mobile + desktop)
- [x] Copy-to-clipboard for generated test cases

## ✅ Phase 5: T — Trigger (COMPLETE)
- [x] Deployment Packaging (`start.sh`, `stop.sh`)
- [x] Cloud Transfer Readiness (`Dockerfile`)
- [x] Automation (`com.testcaseai.server.plist`)
- [x] Documentation (`README.md` & Maintenance Log in `gemini.md`)
- [x] Final verification — TestCase AI is live and generating!
