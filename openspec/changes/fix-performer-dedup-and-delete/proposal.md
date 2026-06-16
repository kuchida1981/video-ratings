## Why

CSV一括登録で同一の未登録出演者名が複数行に出現すると、出演者レコードが行数分重複作成される。また、出演作が1件以上ある出演者を削除すると500エラーが返り削除できない。いずれも出演者データの整合性を損なうため修正する。

## What Changes

- CSV一括登録の実行処理（`/import/execute`）で、同一バッチ内に同名の新規出演者（`performer_id` が `null`）が複数行に出現した場合、最初の1件のみ新規作成し、以降は同じレコードを再利用する
  - 行の処理が例外でロールバックされた場合は、その行で作成した分のキャッシュも取り消す
- `Performer` モデルの `work_performers` リレーションに `cascade="all, delete-orphan"` を追加し、出演作がある出演者の削除を成功させる（削除されるのは作品との関連付け（`WorkPerformer`）のみで、作品自体は残る）
- 上記2点の挙動を担保する軽量なDB結合テストを追加する（テスト用に最小限のDBセッションfixtureを新設）

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `csv-work-import`: インポート実行時、同一バッチ内で同名の新規出演者が複数行に出現した場合は重複登録せず1レコードに統合する要求を追加する

## Impact

- Backend: `app/routers/imports.py`（`execute_import`）、`app/models/models.py`（`Performer.work_performers` リレーション定義）
- Tests: `backend/tests/conftest.py`（DBセッションfixtureを新設）、出演者削除・CSVインポート重複防止の結合テストを追加
- DBスキーマ変更・Alembicマイグレーションは不要（ORMリレーション定義のみの修正）
- フロントエンドの変更なし
