## Why

カスタム項目は現在「作品専用」に固定されており、出演者に独自のメタデータを追加する手段がない。タグカテゴリが `entity_type` で作品・出演者を使い分けているのと同じパターンを、カスタム項目にも適用することで一貫した設計を実現する。あわせて、boolean 型（チェックボックス）を型オプションに追加する。

## What Changes

- `CustomFieldDefinition` に `entity_type`（`"work"` | `"performer"`）カラムを追加し、項目が作品用か出演者用かを区別する
- `Performer` モデルに `custom_fields`（JSONB）カラムを追加する
- boolean 型を `field_type` の選択肢に追加し、DB 値は JSON の `true`/`false` として保存する
- 設定ページを作品用・出演者用の2セクションに分け、それぞれで項目を管理できるようにする
- 出演者詳細ページにカスタム項目の表示・編集セクションを追加する
- 出演者のカスタム項目値を更新する API エンドポイントを追加する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `custom-fields`: entity_type（作品/出演者）の区別、boolean 型の追加、出演者向けカスタム項目 API
- `performer-management`: 出演者詳細に custom_fields 表示・編集セクションを追加

## Impact

- **Backend**: `custom_field_definitions` テーブルに `entity_type` カラム追加（Alembic マイグレーション）、`performers` テーブルに `custom_fields` カラム追加（Alembic マイグレーション）、`/performers/{id}/custom-fields` エンドポイント追加、`FieldType` enum に `boolean` 追加
- **Frontend**: `CustomFieldsPage.tsx`（作品用/出演者用セクション分割）、`WorkDetailPage.tsx`（boolean 型チェックボックス対応）、`PerformerDetailPage.tsx`（カスタム項目セクション追加）、`types/index.ts`（型更新）
- **既存データ**: 既存の `custom_field_definitions` レコードに `entity_type = "work"` をデフォルト値として設定するマイグレーションが必要
