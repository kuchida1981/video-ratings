import bcrypt
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app
from app.models.models import User

pytestmark = pytest.mark.unit


@pytest.fixture
def auth_settings(monkeypatch):
    monkeypatch.setattr(settings, "secret_key", "test-secret-key-for-testing")


@pytest.fixture
def test_user(db_session):
    password_hash = bcrypt.hashpw(b"testpass", bcrypt.gensalt()).decode("utf-8")
    user = User(username="testuser", password_hash=password_hash, role="editor")
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def client(db_session, auth_settings, monkeypatch):
    monkeypatch.setattr("app.routers.auth.SessionLocal", lambda: db_session)
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 200
    assert "session" in response.cookies


def test_login_wrong_password(client, test_user):
    response = client.post("/api/auth/login", json={"username": "testuser", "password": "wrongpass"})
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={"username": "nouser", "password": "testpass"})
    assert response.status_code == 401


def test_logout(client, test_user):
    client.post("/api/auth/login", json={"username": "testuser", "password": "testpass"})
    response = client.post("/api/auth/logout")
    assert response.status_code == 200


def test_me_authenticated(client, test_user):
    login_resp = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass"})
    cookie = login_resp.cookies.get("session")
    response = client.get("/api/auth/me", cookies={"session": cookie})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["role"] == "editor"


def test_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_health_skips_auth(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_without_cookie_returns_401(client):
    response = client.get("/api/works")
    assert response.status_code == 401


def test_api_with_valid_cookie(client, test_user):
    login_resp = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass"})
    cookie = login_resp.cookies.get("session")
    response = client.get("/api/works", cookies={"session": cookie})
    assert response.status_code == 200
