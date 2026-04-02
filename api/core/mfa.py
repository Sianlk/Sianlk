"""TOTP-based MFA using time-based one-time passwords (RFC 6238)."""
import hmac, hashlib, struct, time, base64, os, secrets

def _hotp(key: bytes, counter: int, digits: int = 6) -> str:
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0xF
    code = struct.unpack(">I", digest[offset:offset+4])[0] & 0x7FFFFFFF
    return str(code % (10 ** digits)).zfill(digits)

def generate_totp_secret() -> str:
    """Generate a cryptographically secure TOTP secret (base32)."""
    return base64.b32encode(os.urandom(20)).decode()

def get_totp_token(secret: str, drift: int = 0) -> str:
    """Get TOTP token for given secret and optional time drift (30s window)."""
    key = base64.b32decode(secret, casefold=True)
    counter = int(time.time() // 30) + drift
    return _hotp(key, counter)

def verify_totp(secret: str, token: str) -> bool:
    """Verify TOTP token — checks current window + ±1 window for clock skew."""
    if not secret or not token or len(token) != 6 or not token.isdigit():
        return False
    return any(hmac.compare_digest(get_totp_token(secret, d), token) for d in (-1, 0, 1))

def get_totp_uri(secret: str, account: str, issuer: str = "GeniAI") -> str:
    """Generate otpauth:// URI for QR code generation."""
    return f"otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30"

def generate_backup_codes(count: int = 8) -> list[str]:
    """Generate one-time backup codes for MFA recovery."""
    return [secrets.token_hex(4).upper() for _ in range(count)]
