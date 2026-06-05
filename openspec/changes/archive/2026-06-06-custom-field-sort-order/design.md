## Context

`custom_field_definitions` テーブルには現在 `sort_order` カラムがなく、list API は `name` のアルファベット順で返す。ユーザーが意図した順序で作品・出演者の詳細画面に表示できない。

また `name` に単独ユニーク制約がかかっており、work と performer で同じ名前のカスタム項目を作れない不適切な制約になっている。

タグカテゴリ・タグでは同様の並び替え機能（migration 004、TagsPage.tsx）が実装済みであり、同じパターンを踏襲する。

## Goals / Non-Goals

**Goals:**
- 設定UI（CustomFieldsPage）でカスタム項目をD&Dで並び替え
- sort_order を entity_type（work / performer）ごとに独立管理
- list API が sort_order 順で返し、作品・出演者詳細画面に自動反映
- ユニーク制約を `(entity_type, name)` 複合制約に変更

**Non-Goals:**
- 作品・出演者詳細画面での並び替え（設定UIのみ）
- カスタム項目値に基づくソート
- 項目ごとの表示/非表示の切り替え

## Decisions

### 1. sort_order のスコープ: entity_type ごとに独立

work 用と performer 用でそれぞれ 0, 1, 2... と独立した sort_order を持つ。TagCategory の `entity_type` ごとの管理と同じパターン。グローバル連番にすると entity_type をまたいだ並び替えが発生するリスクがあり、UI の独立性も保ちやすい。

### 2. reorder エンドポイント: `PUT /custom-field-definitions/reorder`

タグと同じシグネチャ `{ ids: number[] }` を使用する。渡された IDs は必ず同じ entity_type に属する（フロントエンドが entity_type ごとに分けて呼ぶ）。サーバー側はインデックス = sort_order として一括更新する。

### 3. ユニーク制約の変更: migration で DROP + CREATE

既存の `custom_field_definitions_name_key` 制約を削除し、`(entity_type, name)` の複合ユニーク制約 `uq_custom_field_definitions_entity_name` を新設する。同一 migration（005）で sort_order カラム追加も行い、既存データは `PARTITION BY entity_type ORDER BY id` で初期化する。

### 4. 新規作成時の sort_order: entity_type 内の MAX + 1

タグと同じパターン。その entity_type 内の現在の最大値 + 1 を設定し、末尾に追加する。

### 5. フロントエンドの D&D: @dnd-kit（既存依存を再利用）

`@dnd-kit/core` と `@dnd-kit/sortable` は TagsPage.tsx で既に使用済み。CustomFieldsPage.tsx に同じ `useSortable` + `GripVertical` ハンドルのパターンを適用する。work と performer の各テーブルを独立した `DndContext` でラップする。

## Risks / Trade-offs

- **同名項目の既存データ**: 現在 `name` が全体でユニークなので、異なる entity_type に同名の項目が存在することはない。migration 後は許容されるようになるが、既存データへの影響はない。
- **migration の後退**: `downgrade()` で複合制約を削除し `name` 単独ユニーク制約を戻す際、同一名の work/performer 項目が存在するとエラーになる可能性がある。ダウングレードは開発環境でのみ想定。

## Migration Plan

1. `005_custom_field_sort_order.py` を適用（`alembic upgrade head`）
2. バックエンドサーバー再起動
3. フロントエンドビルド・デプロイ

ロールバック: `alembic downgrade 004` → 複合制約削除・name 単独制約復元・sort_order カラム削除
