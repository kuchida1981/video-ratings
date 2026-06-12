"""coerce numeric custom field values from string to numeric

Revision ID: 010
Revises: 009
Create Date: 2026-06-12
"""

from alembic import op

revision = "010"
down_revision = "009"
branch_labels = None
depends_on = None

_UPGRADE_SQL = r"""
DO $$
DECLARE
    r RECORD;
    tbl TEXT;
BEGIN
    FOR r IN
        SELECT name, entity_type FROM custom_field_definitions WHERE field_type = 'number'
    LOOP
        tbl := r.entity_type || 's';
        EXECUTE format(
            $q$
            UPDATE %I
            SET custom_fields = custom_fields || jsonb_build_object(
                %L,
                (custom_fields->>%L)::numeric
            )
            WHERE custom_fields ? %L
              AND jsonb_typeof(custom_fields->%L) = 'string'
              AND custom_fields->>%L ~ %L
            $q$,
            tbl,
            r.name, r.name, r.name, r.name, r.name, r.name,
            '^-?[0-9]+(\.[0-9]+)?$'
        );
    END LOOP;
END
$$;
"""

_DOWNGRADE_SQL = r"""
DO $$
DECLARE
    r RECORD;
    tbl TEXT;
BEGIN
    FOR r IN
        SELECT name, entity_type FROM custom_field_definitions WHERE field_type = 'number'
    LOOP
        tbl := r.entity_type || 's';
        EXECUTE format(
            $q$
            UPDATE %I
            SET custom_fields = custom_fields || jsonb_build_object(
                %L,
                (custom_fields->>%L)::text
            )
            WHERE custom_fields ? %L
              AND jsonb_typeof(custom_fields->%L) = 'number'
            $q$,
            tbl,
            r.name, r.name, r.name, r.name
        );
    END LOOP;
END
$$;
"""


def upgrade() -> None:
    op.execute(_UPGRADE_SQL)


def downgrade() -> None:
    op.execute(_DOWNGRADE_SQL)
