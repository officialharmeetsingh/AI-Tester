# 🧪 TestCase AI

**Local LLM Test Case Generator**  
*Powered by Ollama + llama3.2*

TestCase AI is a 100% local, high-fidelity test case generator that uses the A.N.T. 3-layer architecture to ensure reliability and clean separation of concerns.

## 🚀 Quick Start (Local)

1.  **Start Ollama:** Ensure Ollama is running on your machine.
2.  **Pull Model:** 
    ```bash
    ollama pull llama3.2
    ```
3.  **Launch:**
    ```bash
    ./start.sh
    ```

The UI will automatically open at `http://localhost:3000`.

## 🏗️ Architecture (A.N.T.)

-   **Layer 1 (Architecture):** Search in `architecture/`. Contains the prompt logic and SOPs.
-   **Layer 2 (Navigation):** Handled by `server.py`. Routes user input to the LLM.
-   **Layer 3 (Tools):** Search in `tools/` and `public/`. Contains the Ollama client and Chat UI.

## 🛰️ Production / Cloud Transfer

This project can be containerized for cloud environments using Docker:

```bash
docker build -t testcase-ai .
docker run -p 3000:3000 -e OLLAMA_BASE_URL=http://your-ollama-host:11434 testcase-ai
```

## 🛠️ Maintenance

-   **Modify Logic:** Update `architecture/test_case_generation_sop.md` first.
-   **Modify Prompt:** Update `architecture/system_prompt.md`.
-   **Check Health:** Visit `http://localhost:3000/api/health`.

---
*Created using the B.L.A.S.T. protocol.*
