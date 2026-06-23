import bcrypt
import pytest
from click.testing import CliRunner

from app.cli import cli
from app.models.models import User

pytestmark = pytest.mark.unit


@pytest.fixture
def runner(db_session, monkeypatch):
    monkeypatch.setattr(db_session, "close", lambda: None)
    monkeypatch.setattr("app.cli.SessionLocal", lambda: db_session)
    return CliRunner()


@pytest.fixture
def existing_user(db_session):
    password_hash = bcrypt.hashpw(b"oldpass", bcrypt.gensalt()).decode("utf-8")
    user = User(username="alice", password_hash=password_hash, role="editor")
    db_session.add(user)
    db_session.flush()
    return user


def test_create_user(runner, db_session):
    result = runner.invoke(cli, ["user", "create", "bob", "--role", "viewer"], input="mypassword\nmypassword\n")
    assert result.exit_code == 0
    assert "created successfully" in result.output

    from sqlalchemy import select

    user = db_session.execute(select(User).where(User.username == "bob")).scalar_one()
    assert user.role == "viewer"
    assert bcrypt.checkpw(b"mypassword", user.password_hash.encode("utf-8"))


def test_create_duplicate_user(runner, existing_user):
    result = runner.invoke(cli, ["user", "create", "alice"], input="newpass\nnewpass\n")
    assert result.exit_code != 0
    assert "already exists" in result.output


def test_list_users(runner, existing_user):
    result = runner.invoke(cli, ["user", "list"])
    assert result.exit_code == 0
    assert "alice" in result.output
    assert "editor" in result.output


def test_set_role(runner, existing_user, db_session):
    result = runner.invoke(cli, ["user", "set-role", "alice", "viewer"])
    assert result.exit_code == 0
    assert "viewer" in result.output
    db_session.refresh(existing_user)
    assert existing_user.role == "viewer"


def test_set_role_nonexistent(runner):
    result = runner.invoke(cli, ["user", "set-role", "nouser", "viewer"])
    assert result.exit_code != 0
    assert "not found" in result.output


def test_reset_password(runner, existing_user, db_session):
    old_hash = existing_user.password_hash
    result = runner.invoke(cli, ["user", "reset-password", "alice"], input="newpassword\nnewpassword\n")
    assert result.exit_code == 0
    assert "reset successfully" in result.output
    db_session.refresh(existing_user)
    assert existing_user.password_hash != old_hash
    assert bcrypt.checkpw(b"newpassword", existing_user.password_hash.encode("utf-8"))


def test_delete_user(runner, existing_user, db_session):
    result = runner.invoke(cli, ["user", "delete", "alice"])
    assert result.exit_code == 0
    assert "deleted successfully" in result.output

    from sqlalchemy import select

    assert db_session.execute(select(User).where(User.username == "alice")).scalar_one_or_none() is None


def test_delete_nonexistent(runner):
    result = runner.invoke(cli, ["user", "delete", "nouser"])
    assert result.exit_code != 0
    assert "not found" in result.output
