import json
import time

from itsdangerous import BadSignature, SignatureExpired, TimestampSigner

from app.config import settings

SESSION_COOKIE_NAME = "session"
SESSION_MAX_AGE = settings.session_timeout_seconds
SESSION_SECURE = not settings.debug
DUMMY_HASH = "$2b$12$000000000000000000000u2jqDFMFamKruUbZnEooMGprUwvetfC6"


def _get_signer() -> TimestampSigner:
    return TimestampSigner(settings.secret_key)


def create_session_cookie(user_id: int, username: str, role: str) -> str:
    payload = json.dumps(
        {"user_id": user_id, "username": username, "role": role, "issued_at": int(time.time())},
    )
    return _get_signer().sign(payload).decode("utf-8")


def verify_session_cookie(cookie_value: str) -> dict | None:
    try:
        data = _get_signer().unsign(cookie_value, max_age=SESSION_MAX_AGE)
        return json.loads(data)
    except (BadSignature, SignatureExpired):
        return None
