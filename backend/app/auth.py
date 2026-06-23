import base64
import json
import time

from itsdangerous import BadSignature, SignatureExpired, TimestampSigner

from app.config import settings

SESSION_COOKIE_NAME = "session"
SESSION_MAX_AGE = settings.session_timeout_seconds
SESSION_SECURE = settings.cookie_secure
DUMMY_HASH = "$2b$12$000000000000000000000u2jqDFMFamKruUbZnEooMGprUwvetfC6"


def _get_signer() -> TimestampSigner:
    return TimestampSigner(settings.secret_key)


def create_session_cookie(user_id: int, username: str, role: str) -> str:
    payload = json.dumps(
        {"user_id": user_id, "username": username, "role": role, "issued_at": int(time.time())},
    )
    encoded = base64.urlsafe_b64encode(payload.encode()).decode()
    return _get_signer().sign(encoded).decode("utf-8")


def verify_session_cookie(cookie_value: str) -> dict | None:
    try:
        data = _get_signer().unsign(cookie_value, max_age=SESSION_MAX_AGE)
        payload = base64.urlsafe_b64decode(data).decode()
        return json.loads(payload)
    except (BadSignature, SignatureExpired, Exception):
        return None
