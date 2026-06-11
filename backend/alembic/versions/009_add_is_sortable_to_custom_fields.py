"""add is_sortable to custom_field_definitions

Revision ID: 009
Revises: 008
Create Date: 2026-06-11
"""

import sqlalchemy as sa

from alembic import op

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "custom_field_definitions",
        sa.Column("is_sortable", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("custom_field_definitions", "is_sortable")
