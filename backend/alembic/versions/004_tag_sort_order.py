"""tag sort order

Revision ID: 004
Revises: 003
Create Date: 2026-06-05
"""
from alembic import op
import sqlalchemy as sa


revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add sort_order columns
    op.add_column("tag_categories", sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("tags", sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"))
    
    # Initialize sort_order for existing data
    # tag_categories
    op.execute("""
        UPDATE tag_categories
        SET sort_order = sub.rn - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
            FROM tag_categories
        ) sub
        WHERE tag_categories.id = sub.id
    """)
    
    # tags (within each category)
    op.execute("""
        UPDATE tags
        SET sort_order = sub.rn - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY id) as rn
            FROM tags
        ) sub
        WHERE tags.id = sub.id
    """)


def downgrade() -> None:
    op.drop_column("tags", "sort_order")
    op.drop_column("tag_categories", "sort_order")
