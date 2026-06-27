## Context

現在、Google 検索クエリは出演者名・作品タイトルのみで構成されており、カスタム項目の値は利用されていない。4箇所（WorkDetailPage・WorkTable・PerformerDetailPage・PerformerTable）に個別にハードコードされている。

`CustomFieldDefinition` にはすでに `is_sortable` フラグ（boolean）がある。同様のパターンで `is_search_keyword` フラグを追加する。

## Goals / Non-Goals

**Goals:**
- `is_search_keyword = true` のテキスト型カスタム項目値を Google 検索クエリに含める
- CustomFieldsPage に「検索に使う」Switch 列を追加する（text 型のみ有効）
- バックエンド・フロントエンドの型定義を一貫して更新する

**Non-Goals:**
- text 以外の型（number / date / boolean）を検索キーワードに使う
- Google 検索以外の用途（アプリ内検索等）への波及
- クエリ構造の大幅な変更（クオートなし・フィールド名付き等）

## Decisions

### 1. `is_search_keyword` の有効化対象を text 型に限定

**決定**: UI レベルで制限する。`field_type !== "text"` の場合はトグルを `disabled` にする。DB・バックエンドレベルでは型チェックを強制しない（余分な複雑さを避けるため）。

**代替案**: バックエンドでバリデーションしてエラーを返す → 非 text 型に `is_search_keyword = true` が設定されることは通常ありえないため、UI 制限で十分。

### 2. 検索クエリ生成をコンポーネント内にインライン記述

**決定**: 共通ユーティリティ関数を作らず、既存の4箇所を個別に修正する。  
フィルタロジックは1行（`customFieldDefs.filter(d => d.is_search_keyword && d.field_type === "text")`）で済むため、抽象化の恩恵が薄い。

**代替案**: `buildGoogleSearchQuery(entity, defs)` などのヘルパー関数に切り出す → 現時点で4箇所のみ・ロジックが短いため過剰設計。

### 3. 空値の扱い

**決定**: `custom_fields?.[def.name]` の値が空文字・null・undefined の場合はクエリに含めない。フィルタ後に `String(v).trim()` が空のものは除外する。

### 4. 検索クエリの順序

**決定**: 既存のキーワード（出演者名・タイトル）の後ろにカスタム項目値を追加する。`sort_order` 順（`customFieldDefs` の配列順）に並べる。

## Risks / Trade-offs

- [リスク] カスタム項目の値が長いと検索クエリが肥大化する → クオート付きで追加するだけなので Google 側の長さ制限にかかる可能性があるが、実用上は問題ない範囲とみなす。
- [リスク] WorkTable・PerformerTable はすべてのカスタム定義を props として受け取っているが、is_search_keyword が追加されるため型定義の更新が必要 → 型変更は一箇所（`types/index.ts`）のみなので影響範囲は小さい。

## Migration Plan

1. Alembic マイグレーションで `is_search_keyword` カラムを追加（デフォルト `false`、既存レコードへの影響なし）
2. バックエンドのモデル・スキーマ更新
3. フロントエンドの型・UI・クエリ生成ロジック更新
4. ロールバック: カラム削除マイグレーションを作成しておく（データへの影響なし）
