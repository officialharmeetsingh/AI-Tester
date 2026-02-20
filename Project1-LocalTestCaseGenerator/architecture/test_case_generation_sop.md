# SOP: Test Case Generation

## Goal
Transform user-described features, scenarios, or requirements into comprehensive, structured test cases using llama3.2 via Ollama.

## Inputs
| Input | Type | Source |
|-------|------|--------|
| User Message | String | Chat UI text input |
| Conversation History | Array | In-memory session state |

## Process Flow
```
User Input → [Layer 2: Navigation] → Build Messages Array → [Layer 3: Ollama Client] → Stream Response → [Layer 2: Navigation] → Chat UI
```

### Step-by-Step Logic
1. **Receive** user message from the chat UI via POST `/api/chat`
2. **Construct** the messages array:
   - Slot 0: System prompt (from `system_prompt.md` / hardcoded template)
   - Slots 1–N: Conversation history (alternating user/assistant)
   - Last slot: Current user message
3. **Send** to Ollama `/api/chat` endpoint with `stream: true`
4. **Stream** response chunks back to the UI in real-time
5. **Store** the assistant's complete response in conversation history
6. **Display** formatted markdown in the chat bubble

## Edge Cases
| Edge Case | Handling |
|-----------|----------|
| Ollama not running | Return HTTP 503 with clear error message |
| Model not found | Return HTTP 404 with instructions to pull model |
| Empty user input | Return HTTP 400 with validation message |
| Very long input | Truncate to 4000 chars, warn user |
| LLM returns non-test-case content | The system prompt constrains output, but allow it (conversational) |
| Network timeout | 120s timeout, then return error |

## Output
Streamed markdown text containing structured test cases in the format:
- Test Case ID, Title, Description, Preconditions, Steps, Expected Result, Priority, Type
- Summary of test coverage

## Golden Rule
> If this logic changes, update THIS SOP before updating any code.
