## Why

実際にアプリを使ってみて判明した複数のUX上の問題を一括修正する。作品一覧が20件固定表示で全件確認できない、出演者情報が作品一覧に表示されない、出演者の作品数が不明、タグカテゴリ名を作成後に変更できないという4点が使い勝手を損ねている。

## What Changes

- 作品一覧の検索APIが全件を返すようにする（20件固定を廃止）
- 作品一覧テーブルに出演者列を追加し、列順を変更する（出演者・作品名・メーカー・シリーズ・スコア・登録日）
- 出演者一覧テーブルに出演作数列を追加する
- タグカテゴリにインライン編集UIを追加し、カテゴリ名と複数選択可を変更できるようにする
- `entity_type`（対象）の変更は対象外（既存タグとの整合性が崩れるため）

## Capabilities

### New Capabilities

- `works-list-display`: 作品一覧の全件表示と出演者列表示
- `performers-list-work-count`: 出演者一覧への出演作数表示
- `tag-category-editing`: タグカテゴリのインライン編集（名前・複数選択可）

### Modified Capabilities

<!-- なし（既存のspec-level要件変更はない） -->

## Impact

- バックエンド: `app/routers/search.py` — ページング制限を廃止、performers をレスポンスに追加
- バックエンド: `app/schemas/work.py` — `WorkListResponse` に performers フィールドを追加
- バックエンド: `app/routers/performers.py` — `work_count` フィールドをレスポンスに追加
- バックエンド: `app/schemas/performer.py` — `PerformerResponse` に `work_count` を追加
- フロントエンド: `frontend/src/types/index.ts` — `WorkListItem`, `Performer` 型の更新
- フロントエンド: `frontend/src/pages/WorksPage.tsx` — テーブル列の追加・順序変更
- フロントエンド: `frontend/src/pages/PerformersPage.tsx` — 出演作数列の追加
- フロントエンド: `frontend/src/pages/TagsPage.tsx` — カテゴリ編集UIの追加
