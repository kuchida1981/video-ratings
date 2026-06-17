import sys

import pytest
from fastapi.testclient import TestClient

from app.config import settings

pytestmark = pytest.mark.unit


@pytest.fixture
def patch_debug(monkeypatch):
    def _patch(debug_value: bool):
        monkeypatch.setattr(settings, "debug", debug_value)
        # Remove app.main from sys.modules to force a reload with the new settings
        sys.modules.pop("app.main", None)
        from app.main import app

        return app

    yield _patch
    # Clean up after test to ensure other tests get a clean import
    sys.modules.pop("app.main", None)


def test_docs_disabled_when_debug_false(patch_debug):
    app = patch_debug(False)
    with TestClient(app, raise_server_exceptions=False) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/redoc").status_code == 404
        assert client.get("/openapi.json").status_code == 404


def test_docs_enabled_when_debug_true(patch_debug):
    app = patch_debug(True)
    with TestClient(app, raise_server_exceptions=False) as client:
        assert client.get("/docs").status_code == 200
        assert client.get("/openapi.json").status_code == 200
