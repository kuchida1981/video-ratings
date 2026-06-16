## 1. テスト基盤

- [ ] 1.1 `backend/tests/conftest.py` を新設し、`app.database.engine` にバインドした SQLAlchemy `Session` を返す fixture を追加する（テスト後に必ず `rollback()` する）

## 2. Performer削除のカスケード修正

- [ ] 2.1 `backend/app/models/models.py` の `Performer.work_performers` に `cascade="all, delete-orphan"` を追加する
- [ ] 2.2 出演作が1件以上ある出演者を削除すると成功し、`WorkPerformer` は削除されるが `Work` は残ることを検証するテストを追加する（`delete_performer` をDBセッションと共に直接呼び出す方式）

## 3. CSV一括登録の重複防止

- [ ] 3.1 `backend/app/routers/imports.py` の `execute_import` に、名前をキーとしたバッチ内メモ化（`dict[str, Performer]`）を実装する
- [ ] 3.2 行の処理が例外でロールバックされた場合、その行で追加したキャッシュエントリのみ取り除く処理を実装する
- [ ] 3.3 同名・新規出演者が複数行に出現するケースで `Performer` が1件のみ作成されることを検証するテストを追加する（同一行内に同名が複数指定されるケースも含む）
- [ ] 3.4 ロールバックされた行のキャッシュが後続行に引き継がれないことを検証するテストを追加する

## 4. 確認

- [ ] 4.1 `docker compose exec backend pytest` を実行し、全テストが通過することを確認する
- [ ] 4.2 `docker compose exec backend ruff check` で lint エラーがないことを確認する
