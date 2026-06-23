from unittest.mock import MagicMock, patch

import bcrypt
import pytest
from click.testing import CliRunner

from app.cli import cli
from app.models.models import User

pytestmark = pytest.mark.unit


@pytest.fixture
def runner():
    return CliRunner()


@pytest.fixture
def mock_session():
    with patch("app.cli.SessionLocal") as mock_cls:
        session = MagicMock()
        mock_cls.return_value = session
        yield session


def test_user_create(runner, mock_session):
    mock_session.add = MagicMock()
    mock_session.commit = MagicMock()
    result = runner.invoke(cli, ["user", "create", "alice", "--role", "editor"], input="secret\nsecret\n")
    assert result.exit_code == 0
    assert "Created user 'alice'" in result.output
    added_user = mock_session.add.call_args[0][0]
    assert added_user.username == "alice"
    assert added_user.role == "editor"
    assert bcrypt.checkpw(b"secret", added_user.password_hash.encode("utf-8"))


def test_user_create_duplicate(runner, mock_session):
    from sqlalchemy.exc import IntegrityError

    mock_session.commit.side_effect = IntegrityError("", {}, None)
    result = runner.invoke(cli, ["user", "create", "alice", "--role", "editor"], input="secret\nsecret\n")
    assert result.exit_code != 0
    assert "already exists" in result.output


def test_user_list(runner, mock_session):
    user = MagicMock(spec=User)
    user.username = "alice"
    user.role = "editor"
    user.created_at = MagicMock()
    user.created_at.strftime.return_value = "2026-06-23"
    mock_session.query.return_value.order_by.return_value.all.return_value = [user]
    result = runner.invoke(cli, ["user", "list"])
    assert result.exit_code == 0
    assert "alice" in result.output
    assert "editor" in result.output


def test_user_list_empty(runner, mock_session):
    mock_session.query.return_value.order_by.return_value.all.return_value = []
    result = runner.invoke(cli, ["user", "list"])
    assert result.exit_code == 0
    assert "No users found" in result.output


def test_user_set_role(runner, mock_session):
    user = MagicMock(spec=User)
    user.username = "alice"
    user.role = "editor"
    mock_session.query.return_value.filter.return_value.first.return_value = user
    result = runner.invoke(cli, ["user", "set-role", "alice", "viewer"])
    assert result.exit_code == 0
    assert user.role == "viewer"


def test_user_set_role_not_found(runner, mock_session):
    mock_session.query.return_value.filter.return_value.first.return_value = None
    result = runner.invoke(cli, ["user", "set-role", "alice", "viewer"])
    assert result.exit_code != 0
    assert "not found" in result.output


def test_user_reset_password(runner, mock_session):
    user = MagicMock(spec=User)
    user.username = "alice"
    user.password_hash = "old"
    mock_session.query.return_value.filter.return_value.first.return_value = user
    result = runner.invoke(cli, ["user", "reset-password", "alice"], input="newpass\nnewpass\n")
    assert result.exit_code == 0
    assert bcrypt.checkpw(b"newpass", user.password_hash.encode("utf-8"))


def test_user_delete(runner, mock_session):
    user = MagicMock(spec=User)
    user.username = "alice"
    mock_session.query.return_value.filter.return_value.first.return_value = user
    result = runner.invoke(cli, ["user", "delete", "alice"])
    assert result.exit_code == 0
    assert "Deleted user 'alice'" in result.output
    mock_session.delete.assert_called_once_with(user)


def test_user_delete_not_found(runner, mock_session):
    mock_session.query.return_value.filter.return_value.first.return_value = None
    result = runner.invoke(cli, ["user", "delete", "nobody"])
    assert result.exit_code != 0
    assert "not found" in result.output
