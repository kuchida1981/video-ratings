import click
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.models.models import User

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _hash_password(password: str) -> str:
    import bcrypt

    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@click.group()
def cli():
    pass


@cli.group()
def user():
    """Manage users."""


@user.command()
@click.argument("username")
@click.option("--role", type=click.Choice(["viewer", "editor"]), required=True)
def create(username: str, role: str):
    """Create a new user."""
    password = click.prompt("Password", hide_input=True, confirmation_prompt=True)
    db: Session = SessionLocal()
    try:
        u = User(username=username, password_hash=_hash_password(password), role=role)
        db.add(u)
        db.commit()
        click.echo(f"Created user '{username}' (role: {role})")
    except IntegrityError:
        db.rollback()
        raise click.ClickException(f"User '{username}' already exists")
    finally:
        db.close()


@user.command("list")
def list_users():
    """List all users."""
    db: Session = SessionLocal()
    try:
        users = db.query(User).order_by(User.id).all()
        if not users:
            click.echo("No users found.")
            return
        click.echo(f"{'USERNAME':<20} {'ROLE':<10} {'CREATED'}")
        for u in users:
            created = u.created_at.strftime("%Y-%m-%d") if u.created_at else ""
            click.echo(f"{u.username:<20} {u.role:<10} {created}")
    finally:
        db.close()


@user.command("set-role")
@click.argument("username")
@click.argument("role", type=click.Choice(["viewer", "editor"]))
def set_role(username: str, role: str):
    """Change a user's role."""
    db: Session = SessionLocal()
    try:
        u = db.query(User).filter(User.username == username).first()
        if not u:
            raise click.ClickException(f"User '{username}' not found")
        u.role = role
        db.commit()
        click.echo(f"Updated '{username}' role to '{role}'")
    finally:
        db.close()


@user.command("reset-password")
@click.argument("username")
def reset_password(username: str):
    """Reset a user's password."""
    password = click.prompt("New password", hide_input=True, confirmation_prompt=True)
    db: Session = SessionLocal()
    try:
        u = db.query(User).filter(User.username == username).first()
        if not u:
            raise click.ClickException(f"User '{username}' not found")
        u.password_hash = _hash_password(password)
        db.commit()
        click.echo(f"Password reset for '{username}'")
    finally:
        db.close()


@user.command()
@click.argument("username")
def delete(username: str):
    """Delete a user."""
    db: Session = SessionLocal()
    try:
        u = db.query(User).filter(User.username == username).first()
        if not u:
            raise click.ClickException(f"User '{username}' not found")
        db.delete(u)
        db.commit()
        click.echo(f"Deleted user '{username}'")
    finally:
        db.close()


if __name__ == "__main__":
    cli()
