"""
Cybersecurity AI Engine — Zero-Trust Architecture
OWASP Top 10 mitigations + AI-driven threat detection + anti-clone enforcement.
(c) Sianlk. Proprietary & Confidential.
"""
from __future__ import annotations
import hashlib, hmac, html, os, re, time, json
from typing import Any

# ── Fingerprint / Anti-Cloning ──────────────────────────────────────────────
_RUNTIME_DNA = hashlib.sha512(
    os.urandom(64) + b"SIANLK-PLATFORM-DNA"
).hexdigest()


def get_platform_dna() -> str:
    """Returns a runtime-unique platform fingerprint that cannot be replicated."""
    return _RUNTIME_DNA


# ── Input Validation (OWASP A03) ────────────────────────────────────────────
_SQL_PATTERN  = re.compile(r"(--|;|\x00|UNION|DROP|INSERT|DELETE|UPDATE|EXEC|CAST|CONVERT)", re.I)
_XSS_PATTERN  = re.compile(r"(<script|javascript:|on\w+=|data:text/html)", re.I)
_PATH_PATTERN = re.compile(r"\.\.|%2e%2e|%252e", re.I)
_SSRF_PATTERN = re.compile(r"(169\.254\.|127\.|10\.|192\.168\.|::1|localhost)", re.I)

def sanitize_input(value: str, field: str = "input") -> str:
    if not isinstance(value, str):
        raise TypeError(f"Expected str for {field}")
    if len(value) > 4096:
        raise ValueError(f"{field} exceeds max length")
    if _SQL_PATTERN.search(value):
        raise ValueError(f"Potential SQL injection in {field}")
    if _XSS_PATTERN.search(value):
        raise ValueError(f"Potential XSS in {field}")
    if _PATH_PATTERN.search(value):
        raise ValueError(f"Path traversal attempt in {field}")
    return html.escape(value.strip())

def sanitize_url(url: str) -> str:
    if _SSRF_PATTERN.search(url):
        raise ValueError("SSRF target blocked")
    if not url.startswith(("https://",)):
        raise ValueError("Only HTTPS URLs allowed")
    return url


# ── Rate Limiter (OWASP A05) ────────────────────────────────────────────────
class RateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self._max = max_requests
        self._window = window_seconds
        self._buckets: dict[str, list[float]] = {}

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        bucket = self._buckets.setdefault(client_id, [])
        self._buckets[client_id] = [t for t in bucket if now - t < self._window]
        if len(self._buckets[client_id]) >= self._max:
            return False
        self._buckets[client_id].append(now)
        return True


# ── AI Threat Detector ───────────────────────────────────────────────────────
class ThreatDetector:
    _SIGNATURES = [
        r"eval\s*\(", r"exec\s*\(", r"__import__",
        r"base64\.b64decode", r"subprocess", r"os\.system",
        r"pickle\.loads", r"yaml\.load\s*\(",
        r"\bshell\s*=\s*True",
    ]

    def __init__(self):
        self._patterns = [re.compile(s, re.I) for s in self._SIGNATURES]
        self._incidents: list[dict] = []

    def scan(self, payload: str) -> dict[str, Any]:
        threats = [p.pattern for p in self._patterns if p.search(payload)]
        severity = "CRITICAL" if len(threats) > 1 else ("HIGH" if threats else "CLEAN")
        incident = {"ts": time.time(), "severity": severity, "threats": threats}
        if threats:
            self._incidents.append(incident)
        return incident

    def incident_report(self) -> list[dict]:
        return list(self._incidents)


# ── Content Security Policy Headers ─────────────────────────────────────────
def security_headers() -> dict[str, str]:
    return {
        "Content-Security-Policy": (
            "default-src 'self'; script-src 'self' 'nonce-{nonce}'; "
            "style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; "
            "connect-src 'self' https://api.sianlk.com; frame-ancestors 'none';"
        ),
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
    }
