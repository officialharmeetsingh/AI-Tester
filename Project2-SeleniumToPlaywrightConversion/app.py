import streamlit as st
import os
from tools.converter_engine import CodeConverter
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="Selenium to Playwright Converter", layout="wide")

st.title("🚀 Selenium to Playwright Converter")
st.markdown("Convert your TestNG Selenium Java code into Playwright TypeScript using Local LLM (Ollama/CodeLlama).")

# Sidebar for configuration
st.sidebar.header("Configuration")
ollama_url = st.sidebar.text_input("Ollama URL", os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"))
model_name = st.sidebar.text_input("Model Name", os.getenv("OLLAMA_MODEL", "codellama"))

# Main interface
col1, col2 = st.columns(2)

with col1:
    st.header("Selenium Java (TestNG)")
    java_input = st.text_area("Paste your Java code here...", height=400)

with col2:
    st.header("Playwright TypeScript")
    if st.button("Convert ✨"):
        if java_input.strip():
            with st.spinner("Converting logic using CodeLlama..."):
                converter = CodeConverter()
                ts_output = converter.convert_selenium_to_playwright(java_input)
                st.code(ts_output, language="typescript")
                
                # Save to file
                output_dir = os.getenv("CONVERSION_OUTPUT_DIR", "./converted_scripts")
                os.makedirs(output_dir, exist_ok=True)
                file_path = os.path.join(output_dir, "converted_test.spec.ts")
                with open(file_path, "w") as f:
                    f.write(ts_output)
                st.success(f"Converted file saved to: {file_path}")
        else:
            st.warning("Please enter some Java code first.")

st.markdown("---")
st.caption("Built with ❤️ using B.L.A.S.T. Protocol and A.N.T. Architecture.")
