import pytest
from pydantic import ValidationError

from app.schemas.custom_field import CustomFieldDefinitionCreate, FieldType
from app.schemas.imports import ImportPreviewResponse, ImportResult, ImportRow, PerformerMatch
from app.schemas.performer import PerformerCreate, PerformerUpdate
from app.schemas.search import SearchParams
from app.schemas.tag import EntityType, TagCategoryCreate, TagCreate
from app.schemas.work import AddPerformerToWork, WorkCreate, WorkUpdate


@pytest.mark.unit
class TestTagSchemas:
    def test_tag_category_create_valid(self):
        obj = TagCategoryCreate(name="Genre", entity_type="work", is_multi_select=True)
        assert obj.entity_type == EntityType.work

    def test_tag_category_create_invalid_entity_type(self):
        with pytest.raises(ValidationError):
            TagCategoryCreate(name="x", entity_type="invalid", is_multi_select=True)

    def test_tag_create_valid(self):
        obj = TagCreate(name="Action", category_id=1, score=10)
        assert obj.score == 10

    def test_tag_create_score_optional(self):
        obj = TagCreate(name="Action", category_id=1)
        assert obj.score is None


@pytest.mark.unit
class TestWorkSchemas:
    def test_work_create_valid(self):
        obj = WorkCreate(title="Test Work", maker="ACME")
        assert obj.title == "Test Work"
        assert obj.maker == "ACME"

    def test_work_create_optional_fields(self):
        obj = WorkCreate(title="Minimal")
        assert obj.maker is None
        assert obj.series is None

    def test_work_update_all_optional(self):
        obj = WorkUpdate()
        assert obj.title is None

    def test_add_performer_to_work_default_not_main(self):
        obj = AddPerformerToWork(performer_id=1)
        assert obj.is_main is False


@pytest.mark.unit
class TestPerformerSchemas:
    def test_performer_create_valid(self):
        obj = PerformerCreate(name="Alice", furigana="アリス")
        assert obj.name == "Alice"

    def test_performer_create_furigana_optional(self):
        obj = PerformerCreate(name="Bob")
        assert obj.furigana is None

    def test_performer_update_all_optional(self):
        obj = PerformerUpdate()
        assert obj.name is None


@pytest.mark.unit
class TestCustomFieldSchemas:
    def test_custom_field_create_valid(self):
        obj = CustomFieldDefinitionCreate(name="Release Year", field_type="number")
        assert obj.field_type == FieldType.number

    def test_custom_field_create_invalid_type(self):
        with pytest.raises(ValidationError):
            CustomFieldDefinitionCreate(name="x", field_type="invalid_type")


@pytest.mark.unit
class TestImportSchemas:
    def test_import_row_defaults(self):
        row = ImportRow(row_number=1, title="Test", performers=[], directory_path=None)
        assert row.is_valid is True
        assert row.errors == []

    def test_import_row_with_performer_match(self):
        p = PerformerMatch(
            name="田中花子", furigana=None, existing_id=5, existing_name="田中花子", existing_aliases=["はなこ"]
        )
        row = ImportRow(row_number=1, title="Test", performers=[p], directory_path=None)
        assert row.performers[0].existing_id == 5
        assert row.performers[0].existing_aliases == ["はなこ"]

    def test_import_preview_response(self):
        row = ImportRow(row_number=1, title="T", performers=[], directory_path=None)
        resp = ImportPreviewResponse(rows=[row], valid_count=1, error_count=0)
        assert resp.valid_count == 1

    def test_import_result(self):
        result = ImportResult(created_count=3, skipped_count=1, errors=[])
        assert result.created_count == 3


@pytest.mark.unit
class TestSearchSchemas:
    def test_search_params_defaults(self):
        params = SearchParams()
        assert params.sort_by == "created_at"
        assert params.sort_desc is True
        assert params.page == 1
        assert params.page_size == 20

    def test_search_params_with_values(self):
        params = SearchParams(keyword="test", tag_ids=[1, 2], sort_by="total_score")
        assert params.keyword == "test"
        assert params.tag_ids == [1, 2]
