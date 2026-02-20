import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "codellama")

def test_ollama_connection():
    print(f"Testing connection to Ollama at {OLLAMA_BASE_URL}...")
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        if response.status_code == 200:
            print("Successfully connected to Ollama!")
            models = response.json().get("models", [])
            model_names = [m['name'] for m in models]
            print(f"Available models: {', '.join(model_names)}")
            
            if any(OLLAMA_MODEL in name for name in model_names):
                print(f"Target model '{OLLAMA_MODEL}' found.")
                return True
            else:
                print(f"Target model '{OLLAMA_MODEL}' NOT found in available models.")
                return False
        else:
            print(f"Failed to connect. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error connecting to Ollama: {str(e)}")
        return False

if __name__ == "__main__":
    if test_ollama_connection():
        print("Link Phase: Handshake Successful.")
    else:
        print("Link Phase: Handshake Failed.")
