"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "performers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("furigana", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_performers_id", "performers", ["id"])
    op.create_index("ix_performers_name", "performers", ["name"])
    op.create_index("ix_performers_furigana", "performers", ["furigana"])

    op.create_table(
        "works",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("maker", sa.String(), nullable=True),
        sa.Column("series", sa.String(), nullable=True),
        sa.Column("custom_fields", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_works_id", "works", ["id"])
    op.create_index("ix_works_title", "works", ["title"])
    op.create_index("ix_works_maker", "works", ["maker"])
    op.create_index("ix_works_series", "works", ["series"])
    op.create_index("ix_works_custom_fields", "works", ["custom_fields"], postgresql_using="gin")

    op.create_table(
        "work_performers",
        sa.Column("work_id", sa.Integer(), nullable=False),
        sa.Column("performer_id", sa.Integer(), nullable=False),
        sa.Column("is_main", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["performer_id"], ["performers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["work_id"], ["works.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("work_id", "performer_id"),
    )

    op.create_table(
        "work_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("work_id", sa.Integer(), nullable=False),
        sa.Column("path", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=True),
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["work_id"], ["works.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_work_files_id", "work_files", ["id"])
    op.create_index("ix_work_files_work_id", "work_files", ["work_id"])

    op.create_table(
        "tag_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("is_multi_select", sa.Boolean(), nullable=False, server_default="true"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tag_categories_id", "tag_categories", ["id"])

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["tag_categories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tags_id", "tags", ["id"])
    op.create_index("ix_tags_category_id", "tags", ["category_id"])

    op.create_table(
        "work_tags",
        sa.Column("work_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["work_id"], ["works.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("work_id", "tag_id"),
        sa.UniqueConstraint("work_id", "tag_id"),
    )

    op.create_table(
        "performer_tags",
        sa.Column("performer_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["performer_id"], ["performers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("performer_id", "tag_id"),
        sa.UniqueConstraint("performer_id", "tag_id"),
    )

    op.create_table(
        "custom_field_definitions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("field_type", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_custom_field_definitions_id", "custom_field_definitions", ["id"])


def downgrade() -> None:
    op.drop_table("custom_field_definitions")
    op.drop_table("performer_tags")
    op.drop_table("work_tags")
    op.drop_table("tags")
    op.drop_table("tag_categories")
    op.drop_table("work_files")
    op.drop_table("work_performers")
    op.drop_table("works")
    op.drop_table("performers")
