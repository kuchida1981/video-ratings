import pytest

from app.models.models import Performer, Work, WorkPerformer
from app.routers.performers import delete_performer


@pytest.mark.integration
class TestDeletePerformer:
    def test_delete_performer_with_work_succeeds_and_keeps_work(self, db_session):
        work = Work(title="Test Work", custom_fields={})
        db_session.add(work)
        db_session.flush()

        performer = Performer(name="Test Performer")
        db_session.add(performer)
        db_session.flush()

        db_session.add(WorkPerformer(work_id=work.id, performer_id=performer.id, is_main=True))
        db_session.commit()

        work_id = work.id
        performer_id = performer.id

        delete_performer(performer_id, db_session)

        assert db_session.query(Performer).filter(Performer.id == performer_id).first() is None
        assert db_session.query(WorkPerformer).filter(WorkPerformer.performer_id == performer_id).first() is None
        assert db_session.query(Work).filter(Work.id == work_id).first() is not None
