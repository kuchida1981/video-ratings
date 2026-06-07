import pytest
from types import SimpleNamespace

from app.services.score_calculator import ScoreCalculator


def make_tag(score):
    return SimpleNamespace(score=score)


def make_work_tag(score):
    return SimpleNamespace(tag=make_tag(score))


def make_performer_tag(score):
    return SimpleNamespace(tag=make_tag(score))


def make_performer(tag_scores):
    return SimpleNamespace(
        performer_tags=[make_performer_tag(s) for s in tag_scores]
    )


def make_work_performer(performer, is_main=False):
    return SimpleNamespace(performer=performer, is_main=is_main)


def make_work(work_tag_scores, work_performers):
    return SimpleNamespace(
        work_tags=[make_work_tag(s) for s in work_tag_scores],
        work_performers=work_performers,
    )


@pytest.mark.unit
class TestScoreCalculator:
    def setup_method(self):
        self.calc = ScoreCalculator()

    def test_work_score_tag_only(self):
        work = make_work([10, 20], [])
        assert self.calc.calculate_work_total_score(work) == 30

    def test_work_score_adds_main_performer(self):
        performer = make_performer([20])
        wp = make_work_performer(performer, is_main=True)
        work = make_work([10], [wp])
        assert self.calc.calculate_work_total_score(work) == 30

    def test_no_main_performer_score_is_zero(self):
        performer = make_performer([20])
        wp = make_work_performer(performer, is_main=False)
        work = make_work([], [wp])
        assert self.calc._get_main_performer_score(work) == 0

    def test_none_score_tag_ignored(self):
        work = make_work([None, None], [])
        assert self.calc.calculate_work_total_score(work) == 0

    def test_performer_score(self):
        performer = make_performer([5, 10, 15])
        assert self.calc.calculate_performer_score(performer) == 30
