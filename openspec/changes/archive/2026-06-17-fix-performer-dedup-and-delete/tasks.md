## 1. テスト基盤

- [x] 1.1 `backend/tests/conftest.py` を新設し、`app.database.engine` にバインドした SQLAlchemy `Session` を返す fixture を追加する（テスト後に必ず `rollback()` する）
- [x] 1.2 新設するDB結合テストには `@pytest.mark.integration` を付与する（既存CIの `pytest -m unit` には含めない）

## 2. Performer削除のカスケード修正

- [x] 2.1 `backend/app/models/models.py` の `Performer.work_performers` に `cascade="all, delete-orphan"` を追加する
- [x] 2.2 出演作が1件以上ある出演者を削除すると成功し、`WorkPerformer` は削除されるが `Work` は残ることを検証するテストを追加する（`delete_performer` をDBセッションと共に直接呼び出す方式）

## 3. CSV一括登録の重複防止

- [x] 3.1 `backend/app/routers/imports.py` の `execute_import` に、名前をキーとしたバッチ内メモ化（`dict[str, Performer]`）を実装する
- [x] 3.2 行の処理が例外でロールバックされた場合、その行で追加したキャッシュエントリのみ取り除く処理を実装する（同一行内に同名が複数回出現する場合の `WorkPerformer` 重複リンク防止も含む。design.md参照）
- [x] 3.3 同名・新規出演者が複数行に出現するケースで `Performer` が1件のみ作成されることを検証するテストを追加する（同一行内に同名が複数指定されるケースも含む）
- [x] 3.4 ロールバックされた行のキャッシュが後続行に引き継がれないことを検証するテストを追加する

## 4. 確認

- [x] 4.1 `docker compose exec backend pytest` を実行し、全テスト（unit + integration）が通過することを確認する
- [x] 4.2 `docker compose exec backend ruff check` で lint エラーがないことを確認する（CI対象の `app/` 配下、および今回追加したテストファイルで確認。既存の `tests/services/test_score_calculator.py` の未整理import警告はスコープ外・既存issue）
