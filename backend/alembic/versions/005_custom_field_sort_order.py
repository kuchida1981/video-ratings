"""custom field sort order

Revision ID: 005
Revises: 004
Create Date: 2026-06-06
"""
from alembic import op
import sqlalchemy as sa


revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Replace name-only unique constraint with (entity_type, name) composite
    op.drop_constraint("custom_field_definitions_name_key", "custom_field_definitions", type_="unique")
    op.create_unique_constraint(
        "uq_custom_field_definitions_entity_name",
        "custom_field_definitions",
        ["entity_type", "name"],
    )

    # Add sort_order column
    op.add_column(
        "custom_field_definitions",
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )

    # Initialize sort_order per entity_type, ordered by id
    op.execute("""
        UPDATE custom_field_definitions
        SET sort_order = sub.rn - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY entity_type ORDER BY id) AS rn
            FROM custom_field_definitions
        ) sub
        WHERE custom_field_definitions.id = sub.id
    """)


def downgrade() -> None:
    op.drop_column("custom_field_definitions", "sort_order")
    op.drop_constraint("uq_custom_field_definitions_entity_name", "custom_field_definitions", type_="unique")
    op.create_unique_constraint("custom_field_definitions_name_key", "custom_field_definitions", ["name"])
