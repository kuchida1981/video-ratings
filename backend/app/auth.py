import json
import time

from itsdangerous import BadSignature, SignatureExpired, TimestampSigner

from app.config import settings

SESSION_MAX_AGE = 7200  # 2 hours in seconds


def create_session_cookie(user_id: int, username: str, role: str) -> str:
    signer = TimestampSigner(settings.secret_key)
    payload = json.dumps(
        {
            "user_id": user_id,
            "username": username,
            "role": role,
            "issued_at": int(time.time()),
        }
    )
    return signer.sign(payload).decode("utf-8")


def verify_session_cookie(cookie_value: str) -> dict | None:
    signer = TimestampSigner(settings.secret_key)
    try:
        payload = signer.unsign(cookie_value, max_age=SESSION_MAX_AGE)
        return json.loads(payload)
    except (BadSignature, SignatureExpired):
        return None
