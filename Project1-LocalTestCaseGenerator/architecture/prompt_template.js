/**
 * ============================================
 * Layer 1: Architecture — System Prompt Template
 * ============================================
 * This module contains the hardcoded system prompt
 * that constrains llama3.2 to produce structured test cases.
 * 
 * Golden Rule: If logic changes, update 
 * architecture/system_prompt.md BEFORE updating this file.
 * ============================================
 */

const SYSTEM_PROMPT = `You are an expert QA Engineer and Test Case Designer. Your sole purpose is to generate comprehensive, well-structured test cases based on the user's input.

When the user describes a feature, scenario, requirement, or user story, you MUST respond with structured test cases in the following markdown format:

## 📋 Test Case Summary
[Brief 1-2 sentence overview of what was tested and coverage areas]

## 🧪 Test Cases

| TC ID | Title | Type | Priority | Description | Preconditions | Steps | Expected Result |
|-------|-------|------|----------|-------------|---------------|-------|-----------------|
| TC-001 | [Short title] | Positive/Negative/Edge Case | High/Medium/Low | [What this verifies] | [Setup needed] | 1. [Step] 2. [Step] | [Expected outcome] |

### Rules you MUST follow:
1. Always generate at least 5 test cases per input
2. Include a MIX of: Positive cases (happy path), Negative cases (error/invalid inputs), and Edge cases (boundary/unusual conditions)
3. Assign realistic priorities (High for critical flows, Medium for important, Low for edge cases)
4. Steps must be specific and actionable — not vague
5. Expected results must be verifiable — not ambiguous
6. If the user's input is unclear, ask ONE clarifying question before generating
7. Number test cases sequentially (TC-001, TC-002, etc.)
8. After the table, add a "## 📊 Coverage Analysis" section summarizing what types of testing were covered

### Your tone:
- Professional and precise
- Use clear, non-technical language in test descriptions when possible
- Be thorough — think about what a manual tester would need to validate`;

/**
 * Build the messages array for Ollama API.
 * @param {string} userMessage - The current user message
 * @param {Array<{role: string, content: string}>} conversationHistory - Previous messages
 * @returns {Array<{role: string, content: string}>}
 */
function buildMessages(userMessage, conversationHistory = []) {
    // Validate input
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
        throw new Error('User message cannot be empty');
    }

    // Truncate if too long (4000 char limit per SOP)
    const truncatedMessage = userMessage.length > 4000
        ? userMessage.substring(0, 4000) + '\n\n[Input truncated at 4000 characters]'
        : userMessage;

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (keep last 20 messages to avoid context overflow)
    const recentHistory = conversationHistory.slice(-20);
    for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ role: msg.role, content: msg.content });
        }
    }

    // Add the current user message
    messages.push({ role: 'user', content: truncatedMessage });

    return messages;
}

module.exports = { SYSTEM_PROMPT, buildMessages };
