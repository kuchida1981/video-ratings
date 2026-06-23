import sys

import bcrypt
import click
from sqlalchemy import select

from app.database import SessionLocal
from app.models.models import User


@click.group()
def cli():
    pass


@cli.group()
def user():
    """ユーザー管理コマンド"""
    pass


@user.command()
@click.argument("username")
@click.option("--role", type=click.Choice(["viewer", "editor"]), default="editor")
def create(username, role):
    """ユーザーを作成します"""
    db = SessionLocal()
    try:
        existing_user = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if existing_user:
            click.echo(f"Error: User '{username}' already exists.")
            sys.exit(1)

        password = click.prompt("Password", hide_input=True, confirmation_prompt=True)
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        new_user = User(username=username, password_hash=password_hash, role=role)
        db.add(new_user)
        db.commit()
        click.echo(f"User '{username}' created successfully with role '{role}'.")
    except Exception as e:
        db.rollback()
        click.echo(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


@user.command("list")
def list_users():
    """ユーザー一覧を表示します"""
    db = SessionLocal()
    try:
        users = db.execute(select(User).order_by(User.username)).scalars().all()
        if not users:
            click.echo("No users found.")
            return

        click.echo(f"{'Username':<20} {'Role':<10} {'Created At'}")
        click.echo("-" * 50)
        for u in users:
            click.echo(f"{u.username:<20} {u.role:<10} {u.created_at}")
    except Exception as e:
        click.echo(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


@user.command("set-role")
@click.argument("username")
@click.argument("role", type=click.Choice(["viewer", "editor"]))
def set_role(username, role):
    """ユーザーのロールを変更"""
    db = SessionLocal()
    try:
        u = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if not u:
            click.echo(f"Error: User '{username}' not found.")
            sys.exit(1)

        u.role = role
        db.commit()
        click.echo(f"Role for user '{username}' set to '{role}'.")
    except Exception as e:
        db.rollback()
        click.echo(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


@user.command("reset-password")
@click.argument("username")
def reset_password(username):
    """ユーザーのパスワードをリセットします"""
    db = SessionLocal()
    try:
        u = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if not u:
            click.echo(f"Error: User '{username}' not found.")
            sys.exit(1)

        password = click.prompt("Password", hide_input=True, confirmation_prompt=True)
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        u.password_hash = password_hash
        db.commit()
        click.echo(f"Password for user '{username}' reset successfully.")
    except Exception as e:
        db.rollback()
        click.echo(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


@user.command()
@click.argument("username")
def delete(username):
    """ユーザーを削除"""
    db = SessionLocal()
    try:
        u = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if not u:
            click.echo(f"Error: User '{username}' not found.")
            sys.exit(1)

        db.delete(u)
        db.commit()
        click.echo(f"User '{username}' deleted successfully.")
    except Exception as e:
        db.rollback()
        click.echo(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    cli()
