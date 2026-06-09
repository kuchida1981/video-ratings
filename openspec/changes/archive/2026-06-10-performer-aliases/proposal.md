## Why

出演者（performer）は芸名の変更などにより新旧複数の名前を持つことがある。現状は1つの名前しか登録できないため、過去の名前や別称を記録できない。別名を複数管理できるようにすることで、出演者の名前の履歴や異名を正確に記録できるようにする。

## What Changes

- 出演者に別名（alias）を複数設定できるようになる。各別名には名前とふりがなを持つ
- 出演者詳細ページで別名の追加・編集・削除ができる
- 出演者取得 API（`GET /performers/{id}`、`GET /performers`）のレスポンスに `aliases` フィールドを追加する
- 別名管理のための API エンドポイントを追加する（`POST/PUT/DELETE /performers/{id}/aliases`）

## Capabilities

### New Capabilities

- `performer-aliases`: 出演者に対して複数の別名（name + furigana）を管理する機能

### Modified Capabilities

- `performer-management`: 出演者詳細ページに別名管理 UI を追加し、alias CRUD が行える要件を追加する

## Impact

- **DB**: `performer_aliases` テーブルを新設（Alembic migration 007）
- **バックエンド**: `PerformerAlias` モデル、スキーマ、`/performers/{id}/aliases` ルーター追加
- **フロントエンド**: `Performer` 型に `aliases` フィールド追加、`PerformerDetailPage` に別名管理 UI 追加
- **影響なし**: 検索ロジック（`search.py`）、CSV インポート機能
