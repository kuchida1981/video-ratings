"""remove maker and series columns from works

Revision ID: 011
Revises: 010
Create Date: 2026-06-15
"""

import sqlalchemy as sa

from alembic import op

revision = "011"
down_revision = "010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_works_maker", table_name="works")
    op.drop_index("ix_works_series", table_name="works")
    op.drop_column("works", "maker")
    op.drop_column("works", "series")


def downgrade() -> None:
    op.add_column("works", sa.Column("maker", sa.String(), nullable=True))
    op.add_column("works", sa.Column("series", sa.String(), nullable=True))
    op.create_index("ix_works_maker", "works", ["maker"])
    op.create_index("ix_works_series", "works", ["series"])
