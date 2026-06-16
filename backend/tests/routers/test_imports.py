import pytest

from app.models.models import Performer, WorkPerformer
from app.routers.imports import execute_import
from app.schemas.imports import ExecuteRow, ImportExecuteRequest, PerformerExecuteInfo


def make_row(row_number, title, performers, directory_path=None):
    return ExecuteRow(
        row_number=row_number,
        title=title,
        performers=[PerformerExecuteInfo(**p) for p in performers],
        directory_path=directory_path,
    )


@pytest.mark.integration
class TestExecuteImportDedup:
    def test_same_new_performer_across_rows_creates_one_record(self, db_session):
        request = ImportExecuteRequest(
            rows=[
                make_row(2, "作品A", [{"name": "鈴木一郎", "furigana": None, "performer_id": None}]),
                make_row(3, "作品B", [{"name": "鈴木一郎", "furigana": None, "performer_id": None}]),
                make_row(
                    4,
                    "作品C",
                    [
                        {"name": "鈴木一郎", "furigana": None, "performer_id": None},
                        {"name": "鈴木一郎", "furigana": None, "performer_id": None},
                    ],
                ),
            ]
        )

        result = execute_import(request, db_session)

        assert result.created_count == 3
        assert result.skipped_count == 0

        performers = db_session.query(Performer).filter(Performer.name == "鈴木一郎").all()
        assert len(performers) == 1

        # 作品C(row4)は同名出演者を2回指定しているが、同一作品への重複リンクは1本にまとめられる
        work_performer_count = (
            db_session.query(WorkPerformer).filter(WorkPerformer.performer_id == performers[0].id).count()
        )
        assert work_performer_count == 3

    def test_rolled_back_row_does_not_leak_cached_performer(self, db_session):
        request = ImportExecuteRequest(
            rows=[
                make_row(
                    2,
                    "作品A",
                    [
                        {"name": "佐藤花子", "furigana": None, "performer_id": None},
                        {"name": "存在しない人", "furigana": None, "performer_id": 999999},
                    ],
                ),
                make_row(3, "作品B", [{"name": "佐藤花子", "furigana": None, "performer_id": None}]),
            ]
        )

        result = execute_import(request, db_session)

        assert result.created_count == 1
        assert result.skipped_count == 1

        performers = db_session.query(Performer).filter(Performer.name == "佐藤花子").all()
        assert len(performers) == 1
