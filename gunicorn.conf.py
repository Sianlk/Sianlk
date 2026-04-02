"""
gunicorn.conf.py — production ASGI server configuration.
"""
import multiprocessing, os

bind              = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
backlog           = 2048
worker_class      = "uvicorn.workers.UvicornWorker"
workers           = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
threads           = 1
worker_connections = 1000
max_requests      = 1000
max_requests_jitter = 100
timeout           = 30
keepalive         = 5
graceful_timeout  = 30
accesslog         = "-"
errorlog          = "-"
loglevel          = os.environ.get("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s %(D)sus'
preload_app       = True
daemon            = False

def on_starting(server):
    server.log.info("Starting — workers=%d class=%s", workers, worker_class)

def worker_exit(server, worker):
    server.log.info("Worker exited — pid=%d", worker.pid)
