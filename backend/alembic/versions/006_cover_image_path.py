"""add cover_image_path to works and performers

Revision ID: 006
Revises: 005
Create Date: 2026-06-07
"""
from alembic import op
import sqlalchemy as sa


revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("works", sa.Column("cover_image_path", sa.String(), nullable=True))
    op.add_column("performers", sa.Column("cover_image_path", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("works", "cover_image_path")
    op.drop_column("performers", "cover_image_path")
