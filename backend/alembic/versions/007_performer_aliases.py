"""create performer_aliases table

Revision ID: 007
Revises: 006
Create Date: 2026-06-09
"""

import sqlalchemy as sa

from alembic import op

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "performer_aliases",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("performer_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("furigana", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["performer_id"], ["performers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_performer_aliases_id", "performer_aliases", ["id"])
    op.create_index("ix_performer_aliases_performer_id", "performer_aliases", ["performer_id"])
    op.create_index("ix_performer_aliases_name", "performer_aliases", ["name"])
    op.create_index("ix_performer_aliases_furigana", "performer_aliases", ["furigana"])


def downgrade() -> None:
    op.drop_table("performer_aliases")
