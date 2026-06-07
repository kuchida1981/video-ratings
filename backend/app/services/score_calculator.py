from app.models.models import Performer, Work


class ScoreCalculator:
    def calculate_work_total_score(self, work: Work) -> int:
        work_score = sum(wt.tag.score or 0 for wt in work.work_tags)
        performer_score = self._get_main_performer_score(work)
        return work_score + performer_score

    def calculate_performer_score(self, performer: Performer) -> int:
        return sum(pt.tag.score or 0 for pt in performer.performer_tags)

    def _get_main_performer_score(self, work: Work) -> int:
        main_wp = next((wp for wp in work.work_performers if wp.is_main), None)
        if not main_wp:
            return 0
        return self.calculate_performer_score(main_wp.performer)


score_calculator = ScoreCalculator()
