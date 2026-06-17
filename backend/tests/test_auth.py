from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app


@pytest.fixture
def auth_client(monkeypatch):
    monkeypatch.setattr(settings, "basic_auth_enabled", True)
    monkeypatch.setattr(settings, "basic_auth_user", "testuser")
    monkeypatch.setattr(settings, "basic_auth_password", "testpass")

    # DBアクセスでエラーが発生しないよう、空のリストを返すモックセッションを使用する
    mock_db = MagicMock()
    mock_db.query.return_value.options.return_value.order_by.return_value.all.return_value = []

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_unauthenticated_returns_401(auth_client):
    response = auth_client.get("/works")
    assert response.status_code == 401
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == 'Basic realm="Restricted"'


def test_health_skips_auth(auth_client):
    response = auth_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_valid_credentials(auth_client):
    response = auth_client.get("/works", auth=("testuser", "testpass"))
    assert response.status_code == 200
    assert response.json() == []


def test_invalid_credentials(auth_client):
    response = auth_client.get("/works", auth=("testuser", "wrongpass"))
    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == 'Basic realm="Restricted"'

    response = auth_client.get("/works", auth=("wronguser", "testpass"))
    assert response.status_code == 401
