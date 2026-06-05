## Why

設定UIで作成したカスタム項目が名前のアルファベット順でしか並ばず、ユーザーが意図した順序で作品・出演者の画面に表示できない。また、現在の `name` 単独ユニーク制約は entity_type をまたいで名前が重複できない不適切な制約になっている。

## What Changes

- `custom_field_definitions` テーブルに `sort_order` カラムを追加（entity_type ごとに独立した連番）
- ユニーク制約を `name` 単独から `(entity_type, name)` の複合制約に変更 **BREAKING**
- 設定UIの CustomFieldsPage でカスタム項目行をドラッグ＆ドロップで並び替えできるようにする
- `PUT /custom-field-definitions/reorder` エンドポイントを追加
- list API が `sort_order` 順で返すようになり、作品・出演者詳細画面に表示順が自動反映される
- 新規作成時は対象 entity_type 内の末尾に追加される

## Capabilities

### New Capabilities

- `custom-field-sort-order`: 設定UIでカスタム項目の表示順をドラッグ＆ドロップで並び替え、作品・出演者画面に反映する

### Modified Capabilities

- `custom-fields`: ユニーク制約を `(entity_type, name)` の複合制約に変更し、sort_order を持つように要件を拡張

## Impact

- **バックエンド**: `backend/alembic/versions/005_custom_field_sort_order.py`（新規migration）、`backend/app/models/models.py`、`backend/app/schemas/custom_field.py`、`backend/app/routers/custom_fields.py`
- **フロントエンド**: `frontend/src/pages/CustomFieldsPage.tsx`、`frontend/src/api/client.ts`
- **依存ライブラリ**: `@dnd-kit/core`、`@dnd-kit/sortable`（既にインストール済み）
- **既存データ**: migration で既存の sort_order を entity_type ごとに id 順で初期化
