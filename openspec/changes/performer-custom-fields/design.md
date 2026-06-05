## Context

カスタム項目（`custom_field_definitions` テーブル）は現在、作品専用のメタデータ追加機能として実装されている。`field_type` は `text` / `number` / `date` の3種類で、値は `works.custom_fields`（JSONB）に保存される。

タグカテゴリは既に `entity_type: "work" | "performer"` で同じエンティティ間の区別を実現しており、このパターンを踏襲する。

## Goals / Non-Goals

**Goals:**
- `custom_field_definitions` に `entity_type` カラムを追加し、作品用・出演者用を区別する
- `performers` テーブルに `custom_fields`（JSONB）カラムを追加する
- `field_type` に `boolean` を追加し、チェックボックス UI を提供する
- 設定ページに出演者用カスタム項目セクションを追加する
- 出演者詳細ページでカスタム項目の表示・編集ができるようにする

**Non-Goals:**
- カスタム項目の並び順変更
- カスタム項目定義の編集（名前変更等）— 既存の未対応機能の範囲外
- カスタム項目による出演者の検索・フィルタリング

## Decisions

### entity_type の持たせ方

**決定**: `custom_field_definitions` に `entity_type VARCHAR NOT NULL DEFAULT 'work'` を追加する。

既存の `tag_categories` と同じパターンのため一貫性がある。別テーブルに分割するアプローチ（`work_custom_field_definitions` / `performer_custom_field_definitions`）も考えたが、API・スキーマ・フロントエンドの複雑度が無駄に増えるため採用しない。

既存レコードへのデフォルト値 `"work"` 付与は Alembic マイグレーションで対応する。

### boolean 値の保存形式

**決定**: JSONB に JSON の `true`/`false`（boolean）として保存する。

`"true"`/`"false"` の文字列として保存するアプローチも検討したが、型情報が失われ後々の集計・フィルタリングで不便なため採用しない。フロントエンドの `updateCustomField` は `string | boolean` を受け取れるよう変更する。

### API 設計

**決定**: 出演者のカスタム項目更新は既存の performers ルーターに `PATCH /performers/{id}/custom-fields` を追加する。

`works` ルーターに `PATCH /works/{id}/custom-fields` があるのと対称的な設計にする。

### 設定ページの UI 構造

**決定**: `CustomFieldsPage` を「作品用カスタム項目」と「出演者用カスタム項目」の2セクションに分割する（タブではなく縦に並べる）。

項目数が少ない想定のため、タブで切り替えるほどの複雑さは不要と判断した。

## Risks / Trade-offs

- **既存データの後方互換性**: 既存の `custom_field_definitions` レコードに `entity_type = 'work'` を付与するマイグレーションを忘れると、設定ページで既存の項目が「作品用」セクションに表示されなくなる。→ Alembic マイグレーションの `server_default` と `nullable=False` で保証する。
- **boolean 値の混在**: 既存の text 型フィールドに `"true"` という文字列が保存されているケースは理論上ありうるが、型情報が `field_type` で管理されているため UI 側では問題なく区別できる。

## Migration Plan

1. Alembic マイグレーション追加:
   - `custom_field_definitions.entity_type VARCHAR NOT NULL DEFAULT 'work'`（既存レコードに `'work'` を設定）
   - `performers.custom_fields JSONB DEFAULT '{}'`
2. バックエンドのスキーマ・ルーター更新
3. フロントエンド更新（設定ページ分割、出演者詳細ページ追加）

ロールバック: マイグレーションを revert し、フロントエンドを以前のコードに戻す。`performers.custom_fields` カラム削除で出演者のカスタムデータが失われるが、この段階では新規データのみのため許容範囲。
