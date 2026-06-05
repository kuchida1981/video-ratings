"""performer custom fields

Revision ID: 003
Revises: 002
Create Date: 2026-06-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "custom_field_definitions",
        sa.Column("entity_type", sa.String(), nullable=False, server_default="work"),
    )
    op.add_column(
        "performers",
        sa.Column("custom_fields", JSONB(), nullable=True, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("performers", "custom_fields")
    op.drop_column("custom_field_definitions", "entity_type")
