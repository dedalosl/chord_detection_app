# ── Stage 1: Python deps ───────────────────────────────────────────────────────
FROM python:3.11-slim AS python-deps

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# ── Stage 2: Final image ───────────────────────────────────────────────────────
FROM node:20-slim

# Install Python runtime + ffmpeg (needed by librosa for MP3 decoding)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from stage 1
COPY --from=python-deps /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=python-deps /usr/local/bin/python3 /usr/local/bin/python3
COPY --from=python-deps /usr/local/bin/python3.11 /usr/local/bin/python3.11

# Make python3 available on PATH
RUN ln -sf /usr/local/bin/python3 /usr/bin/python3

WORKDIR /app

# Install Node dependencies
COPY package.json .
RUN npm install --omit=dev

# Copy application source
COPY . .

# Uploads directory (ephemeral, cleaned up per-request)
RUN mkdir -p public/uploads

EXPOSE 3000

CMD ["node", "public/server.js"]
