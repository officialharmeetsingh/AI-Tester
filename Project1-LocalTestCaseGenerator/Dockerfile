# TestCase AI Dockerfile
# Facilitates "Cloud Transfer" as requested in Phase 5

FROM python:3.11-slim

WORKDIR /app

# Copy project files
COPY server.py .
COPY architecture/ architecture/
COPY tools/ tools/
COPY public/ public/

# Expose the server port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV OLLAMA_MODEL=llama3.2

# Start the server
CMD ["python3", "server.py"]
