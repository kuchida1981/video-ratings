"""add memo to works and performers

Revision ID: 008
Revises: 007
Create Date: 2026-06-11
"""

import sqlalchemy as sa

from alembic import op

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("works", sa.Column("memo", sa.Text(), nullable=True))
    op.add_column("performers", sa.Column("memo", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("works", "memo")
    op.drop_column("performers", "memo")
