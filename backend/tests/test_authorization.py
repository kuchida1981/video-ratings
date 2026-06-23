import bcrypt
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app
from app.models.models import User

pytestmark = pytest.mark.integration


@pytest.fixture
def auth_settings(monkeypatch):
    monkeypatch.setattr(settings, "secret_key", "test-secret-key-for-testing")


@pytest.fixture
def viewer_user(db_session):
    password_hash = bcrypt.hashpw(b"viewerpass", bcrypt.gensalt()).decode("utf-8")
    user = User(username="viewer", password_hash=password_hash, role="viewer")
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def editor_user(db_session):
    password_hash = bcrypt.hashpw(b"editorpass", bcrypt.gensalt()).decode("utf-8")
    user = User(username="editor", password_hash=password_hash, role="editor")
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


def _login(client, username, password):
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    return resp.cookies.get("session")


def test_viewer_get_allowed(client, viewer_user):
    cookie = _login(client, "viewer", "viewerpass")
    response = client.get("/api/works", cookies={"session": cookie})
    assert response.status_code == 200


def test_viewer_post_forbidden(client, viewer_user):
    cookie = _login(client, "viewer", "viewerpass")
    response = client.post("/api/works", json={"title": "test"}, cookies={"session": cookie})
    assert response.status_code == 403


def test_viewer_put_forbidden(client, viewer_user):
    cookie = _login(client, "viewer", "viewerpass")
    response = client.put("/api/works/1", json={"title": "test"}, cookies={"session": cookie})
    assert response.status_code == 403


def test_viewer_patch_forbidden(client, viewer_user):
    cookie = _login(client, "viewer", "viewerpass")
    response = client.patch("/api/works/1/custom-fields", json={}, cookies={"session": cookie})
    assert response.status_code == 403


def test_viewer_delete_forbidden(client, viewer_user):
    cookie = _login(client, "viewer", "viewerpass")
    response = client.delete("/api/works/1", cookies={"session": cookie})
    assert response.status_code == 403


def test_viewer_auth_login_allowed(client, viewer_user):
    """viewer でも /api/auth/login への POST は許可される"""
    response = client.post("/api/auth/login", json={"username": "viewer", "password": "viewerpass"})
    assert response.status_code == 200


def test_viewer_auth_logout_allowed(client, viewer_user):
    """viewer でも /api/auth/logout への POST は許可される"""
    cookie = _login(client, "viewer", "viewerpass")
    response = client.post("/api/auth/logout", cookies={"session": cookie})
    assert response.status_code == 200


def test_viewer_export_allowed(client, viewer_user):
    """viewer でも GET /api/export は許可される"""
    cookie = _login(client, "viewer", "viewerpass")
    response = client.get("/api/export", cookies={"session": cookie})
    assert response.status_code == 200


def test_editor_post_allowed(client, editor_user):
    cookie = _login(client, "editor", "editorpass")
    response = client.post("/api/works", json={"title": "test work"}, cookies={"session": cookie})
    assert response.status_code in (200, 201, 422)  # 422 if validation fails, but not 403


def test_editor_delete_allowed(client, editor_user):
    cookie = _login(client, "editor", "editorpass")
    response = client.delete("/api/works/99999", cookies={"session": cookie})
    assert response.status_code != 403  # 404 is OK, but not 403
