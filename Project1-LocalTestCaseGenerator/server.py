"""
============================================
Layer 2: Navigation — Python HTTP Server
============================================
Routes between Layer 1 (Architecture/Prompts) and Layer 3 (Tools/Ollama).
Uses only Python standard library — zero external dependencies.
============================================
"""

import http.server
import json
import os
import urllib.request
import urllib.error
from pathlib import Path

PORT = int(os.environ.get('PORT', 3000))
OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2')
PUBLIC_DIR = Path(__file__).parent / 'public'

# ─────────────────────────────────────────────
# Layer 1: System Prompt (from architecture/)
# ─────────────────────────────────────────────
SYSTEM_PROMPT = """You are an expert QA Engineer and Test Case Designer. Your sole purpose is to generate comprehensive, well-structured test cases based on the user's input.

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
- Be thorough — think about what a manual tester would need to validate"""


def build_messages(user_message, history=None):
    """Layer 1: Build the messages array for Ollama API."""
    if not user_message or not user_message.strip():
        raise ValueError("User message cannot be empty")

    # Truncate if too long (4000 char limit per SOP)
    if len(user_message) > 4000:
        user_message = user_message[:4000] + "\n\n[Input truncated at 4000 characters]"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add conversation history (keep last 20 messages)
    if history:
        for msg in history[-20:]:
            if msg.get("role") in ("user", "assistant"):
                messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": user_message})
    return messages


def ollama_health_check():
    """Layer 3: Check Ollama health and model availability."""
    try:
        req = urllib.request.Request(f"{OLLAMA_BASE_URL}/")
        with urllib.request.urlopen(req, timeout=5) as res:
            running = "Ollama is running" in res.read().decode()

        req2 = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags")
        with urllib.request.urlopen(req2, timeout=5) as res2:
            tags_data = json.loads(res2.read().decode())
            models = [m["name"] for m in tags_data.get("models", [])]
            model_available = any(m.startswith(OLLAMA_MODEL) for m in models)

        return {"running": running, "modelAvailable": model_available, "models": models}
    except Exception as e:
        return {"running": False, "modelAvailable": False, "models": [], "error": str(e)}


def ollama_chat_stream(messages):
    """Layer 3: Send chat request to Ollama and return streaming response."""
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": True
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    return urllib.request.urlopen(req, timeout=120)


class TestCaseHandler(http.server.SimpleHTTPRequestHandler):
    """Layer 2: Navigation — HTTP request handler."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/api/health":
            self._handle_health()
        elif self.path == "/" or self.path == "/index.html":
            self.path = "/index.html"
            super().do_GET()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/chat":
            self._handle_chat()
        else:
            self._send_json(404, {"error": "Not found"})

    def _handle_health(self):
        status = ollama_health_check()
        self._send_json(200, {
            "status": "ok" if status["running"] else "error",
            "ollama": status["running"],
            "model": OLLAMA_MODEL,
            "modelAvailable": status["modelAvailable"],
            "availableModels": status["models"],
            "error": status.get("error")
        })

    def _handle_chat(self):
        try:
            # Parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_length).decode("utf-8"))

            message = body.get("message", "").strip()
            history = body.get("history", [])

            # Validation
            if not message:
                self._send_json(400, {
                    "error": "Message cannot be empty",
                    "hint": "Please describe a feature, scenario, or requirement to generate test cases."
                })
                return

            # Build messages (Layer 1)
            messages = build_messages(message, history)

            # Call Ollama (Layer 3) — streaming
            try:
                ollama_res = ollama_chat_stream(messages)
            except urllib.error.URLError:
                self._send_json(503, {
                    "error": "Ollama is not running",
                    "hint": "Start Ollama with: ollama serve"
                })
                return

            # Stream SSE response
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            full_response = ""

            for line in ollama_res:
                try:
                    chunk = json.loads(line.decode("utf-8"))
                    content = chunk.get("message", {}).get("content", "")
                    done = chunk.get("done", False)

                    if content:
                        full_response += content
                        sse_data = json.dumps({"content": content, "done": False})
                        self.wfile.write(f"data: {sse_data}\n\n".encode("utf-8"))
                        self.wfile.flush()

                    if done:
                        sse_data = json.dumps({"content": "", "done": True, "fullResponse": full_response})
                        self.wfile.write(f"data: {sse_data}\n\n".encode("utf-8"))
                        self.wfile.flush()
                except (json.JSONDecodeError, UnicodeDecodeError):
                    continue

            ollama_res.close()

        except ValueError as e:
            self._send_json(400, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": "Internal server error", "message": str(e)})

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def log_message(self, format, *args):
        """Custom log format."""
        print(f"  [{self.log_date_time_string()}] {args[0]}")


def main():
    print("")
    print("╔══════════════════════════════════════════════╗")
    print("║   🧪 Local Test Case Generator              ║")
    print("║   Powered by Ollama + llama3.2               ║")
    print("╠══════════════════════════════════════════════╣")
    print(f"║   🌐 UI:     http://localhost:{PORT}            ║")
    print(f"║   🔗 API:    http://localhost:{PORT}/api/chat   ║")
    print(f"║   ❤️  Health: http://localhost:{PORT}/api/health ║")
    print("╚══════════════════════════════════════════════╝")
    print("")

    server = http.server.HTTPServer(("0.0.0.0", PORT), TestCaseHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
