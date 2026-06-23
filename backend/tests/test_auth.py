import time
from unittest.mock import MagicMock, patch

import bcrypt
import pytest
from fastapi.testclient import TestClient

from app.auth import SESSION_COOKIE_NAME, create_session_cookie, verify_session_cookie
from app.database import get_db
from app.main import app
from app.models.models import User

pytestmark = pytest.mark.unit


def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@pytest.fixture
def mock_db():
    db = MagicMock()
    return db


@pytest.fixture
def client(mock_db):
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def editor_user():
    user = MagicMock(spec=User)
    user.id = 1
    user.username = "editor1"
    user.password_hash = _hash("editorpass")
    user.role = "editor"
    return user


@pytest.fixture
def viewer_user():
    user = MagicMock(spec=User)
    user.id = 2
    user.username = "viewer1"
    user.password_hash = _hash("viewerpass")
    user.role = "viewer"
    return user


def _set_query_result(mock_db, user):
    mock_db.query.return_value.filter.return_value.first.return_value = user


def test_login_success(client, mock_db, editor_user):
    _set_query_result(mock_db, editor_user)
    response = client.post("/api/auth/login", json={"username": "editor1", "password": "editorpass"})
    assert response.status_code == 200
    assert response.json()["username"] == "editor1"
    assert response.json()["role"] == "editor"
    assert SESSION_COOKIE_NAME in response.cookies


def test_login_wrong_password(client, mock_db, editor_user):
    _set_query_result(mock_db, editor_user)
    response = client.post("/api/auth/login", json={"username": "editor1", "password": "wrong"})
    assert response.status_code == 401


def test_login_unknown_user(client, mock_db):
    _set_query_result(mock_db, None)
    response = client.post("/api/auth/login", json={"username": "nobody", "password": "pass"})
    assert response.status_code == 401


def test_logout(client, mock_db, editor_user):
    _set_query_result(mock_db, editor_user)
    client.post("/api/auth/login", json={"username": "editor1", "password": "editorpass"})
    response = client.post("/api/auth/logout")
    assert response.status_code == 200


def test_me_authenticated(client, mock_db, editor_user):
    _set_query_result(mock_db, editor_user)
    client.post("/api/auth/login", json={"username": "editor1", "password": "editorpass"})
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "editor1"
    assert response.json()["role"] == "editor"


def test_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_unauthenticated_api_returns_401(client):
    response = client.get("/api/works")
    assert response.status_code == 401


def test_health_skips_auth(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_session_timeout():
    cookie = create_session_cookie(1, "test", "editor")
    assert verify_session_cookie(cookie) is not None

    with patch("app.auth.SESSION_MAX_AGE", 1):
        cookie = create_session_cookie(1, "test", "editor")
        time.sleep(2)
        assert verify_session_cookie(cookie) is None
