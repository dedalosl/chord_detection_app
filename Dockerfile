FROM python:3.11-slim

# ffmpeg is required by librosa to decode MP3/M4A files
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

EXPOSE 8080

CMD ["gunicorn", "-c", "gunicorn_config.py", "app:app"]
