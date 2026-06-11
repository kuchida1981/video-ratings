## Why

作品一覧・出演者一覧・出演者ページの作品一覧において、現在は「登録日順」「スコア順」「名前順」などの固定項目でしかソートできない。カスタム項目（発売日・評価数など）でも並べ替えたいが手段がない。

## What Changes

- `CustomFieldDefinition` に `is_sortable` フラグを追加（デフォルト: `false`）
- カスタム項目設定ページに「並べ替えに使う」トグルUIを追加
- `is_sortable=true` のカスタム項目が各一覧ページのソートボタンとして動的に表示される
- バックエンドの works 検索 API が `sort_by=custom:<フィールド名>` 形式に対応
- 出演者一覧のクライアントサイドソートを拡張し、カスタム項目でソート可能にする
- 出演者詳細ページの作品一覧にソートUI（デフォルト: 登録日降順）を追加

## Capabilities

### New Capabilities

- `custom-field-sortable`: カスタム項目の `is_sortable` フラグ管理と設定UI
- `list-sort-by-custom-field`: 各一覧ページでのカスタム項目ソート機能

### Modified Capabilities

- `custom-fields`: `CustomFieldDefinition` に `is_sortable` フィールド追加（スキーマ変更）
- `performer-list-sort`: 出演者一覧ソートにカスタム項目対応を追加
- `search`: works 検索 API に `custom:*` sort_by 対応を追加

## Impact

- **Backend**: `custom_field_definitions` テーブルへのカラム追加（Alembicマイグレーション）
- **Backend**: `GET /works/search` API の `sort_by` パラメータ拡張
- **Backend**: `PUT /custom-field-definitions/{id}` で `is_sortable` 更新対応
- **Frontend**: `WorksPage.tsx`, `PerformersPage.tsx`, `PerformerDetailPage.tsx`, `CustomFieldsPage.tsx` の変更
- **Breaking**: なし（既存ソート動作は維持）
