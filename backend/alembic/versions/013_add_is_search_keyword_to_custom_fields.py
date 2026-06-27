"""add is_search_keyword to custom_field_definitions

Revision ID: 013
Revises: 012
Create Date: 2026-06-28
"""

import sqlalchemy as sa

from alembic import op

revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "custom_field_definitions",
        sa.Column("is_search_keyword", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("custom_field_definitions", "is_search_keyword")
