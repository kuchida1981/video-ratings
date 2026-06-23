from unittest.mock import MagicMock

import bcrypt
import pytest
from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models.models import User

pytestmark = pytest.mark.unit


def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _make_user(role: str):
    user = MagicMock(spec=User)
    user.id = 1
    user.username = f"{role}1"
    user.password_hash = _hash("pass")
    user.role = role
    return user


@pytest.fixture
def mock_db():
    db = MagicMock()
    return db


def _login(client, mock_db, role: str):
    user = _make_user(role)
    mock_db.query.return_value.filter.return_value.first.return_value = user
    client.post("/api/auth/login", json={"username": user.username, "password": "pass"})
    mock_db.reset_mock()
    mock_db.query.return_value.filter.return_value.first.return_value = user
    return user


@pytest.fixture
def editor_client(mock_db, monkeypatch):
    monkeypatch.setattr("app.main.SessionLocal", lambda: mock_db)
    monkeypatch.setattr("app.auth.SESSION_SECURE", False)
    monkeypatch.setattr("app.routers.auth.SESSION_SECURE", False)
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app, raise_server_exceptions=False) as c:
        _login(c, mock_db, "editor")
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def viewer_client(mock_db, monkeypatch):
    monkeypatch.setattr("app.main.SessionLocal", lambda: mock_db)
    monkeypatch.setattr("app.auth.SESSION_SECURE", False)
    monkeypatch.setattr("app.routers.auth.SESSION_SECURE", False)
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app, raise_server_exceptions=False) as c:
        _login(c, mock_db, "viewer")
        yield c
    app.dependency_overrides.clear()


def test_viewer_can_get(viewer_client, mock_db):
    mock_db.query.return_value.options.return_value.order_by.return_value.all.return_value = []
    response = viewer_client.get("/api/works")
    assert response.status_code == 200


def test_viewer_blocked_post(viewer_client):
    response = viewer_client.post("/api/works", json={"title": "test"})
    assert response.status_code == 403


def test_viewer_blocked_put(viewer_client):
    response = viewer_client.put("/api/works/1", json={"title": "test"})
    assert response.status_code == 403


def test_viewer_blocked_delete(viewer_client):
    response = viewer_client.delete("/api/works/1")
    assert response.status_code == 403


def test_editor_can_post(editor_client, mock_db):
    mock_work = MagicMock()
    mock_work.id = 1
    mock_work.title = "test"
    mock_work.cover_image_path = None
    mock_work.custom_fields = {}
    mock_work.memo = None
    mock_work.work_performers = []
    mock_work.files = []
    mock_work.work_tags = []
    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock(side_effect=lambda obj: setattr(obj, "id", 1))
    mock_db.query.return_value.options.return_value.filter.return_value.first.return_value = mock_work
    response = editor_client.post("/api/works", json={"title": "test"})
    assert response.status_code in (200, 201)


def test_viewer_can_logout(viewer_client):
    response = viewer_client.post("/api/auth/logout")
    assert response.status_code == 200


def test_viewer_can_access_auth_me(viewer_client):
    response = viewer_client.get("/api/auth/me")
    assert response.status_code == 200
