"""Gunicorn configuration file for production."""

import os

# macOS fork fix - set before any imports
os.environ.setdefault("OBJC_DISABLE_INITIALIZE_FORK_SAFETY", "YES")

# Binding
bind = f"0.0.0.0:{os.environ.get('PORT', '3000')}"

# Worker configuration
# Use threads on macOS to avoid fork() issues
workers = 1
threads = int(os.environ.get("GUNICORN_THREADS", 4))
worker_class = "gthread"  # Threaded workers avoid fork issues on macOS
timeout = 180  # Longer timeout for audio processing
graceful_timeout = 30

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "chord-detection-app"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (enable if SSL_CERT_FILE and SSL_KEY_FILE are set)
keyfile = os.environ.get("SSL_KEY_FILE", None)
certfile = os.environ.get("SSL_CERT_FILE", None)

# Preload app for faster worker spawn
preload_app = True


def on_starting(server):
    """Called just before the master process is initialized."""
    server.log.info("Starting Chord Detection App server")


def when_ready(server):
    """Called just after the server is started."""
    server.log.info(f"Server ready. Listening on: {bind}")


def worker_int(worker):
    """Called just after a worker exited on SIGINT or SIGQUIT."""
    worker.log.info(f"Worker {worker.pid} received SIGINT/SIGQUIT")
