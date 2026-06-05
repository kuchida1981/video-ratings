## 1. DB マイグレーション

- [x] 1.1 `backend/alembic/versions/004_tag_sort_order.py` を作成し、`tag_categories.sort_order` と `tags.sort_order` カラムを追加する（既存データは id 昇順で採番）

## 2. バックエンド — モデル・スキーマ

- [x] 2.1 `backend/app/models/models.py` の `TagCategory` モデルに `sort_order = Column(Integer, nullable=False, default=0)` を追加する
- [x] 2.2 `backend/app/models/models.py` の `Tag` モデルに `sort_order = Column(Integer, nullable=False, default=0)` を追加し、`TagCategory.tags` リレーションに `order_by=Tag.sort_order.asc()` を設定する
- [x] 2.3 `backend/app/schemas/tag.py` の `TagCategoryResponse` と `TagResponse` に `sort_order: int` フィールドを追加する

## 3. バックエンド — API ルーター

- [x] 3.1 `backend/app/routers/tags.py` の `list_categories` で `ORDER BY sort_order ASC, id ASC` でソートするよう修正する
- [x] 3.2 `backend/app/routers/tags.py` の `create_category` で `sort_order = MAX(sort_order) + 1` を自動採番するよう修正する
- [x] 3.3 `backend/app/routers/tags.py` の `create_tag` で `sort_order = MAX(sort_order) + 1`（同カテゴリ内）を自動採番するよう修正する
- [x] 3.4 `backend/app/routers/tags.py` に `PUT /tag-categories/reorder` エンドポイントを追加する（body: `{ids: [int]}`、受け取った順に `sort_order = 0,1,2,...` を採番）
- [x] 3.5 `backend/app/routers/tags.py` に `PUT /tags/reorder` エンドポイントを追加する（body: `{ids: [int]}`、受け取った順に `sort_order = 0,1,2,...` を採番）

## 4. フロントエンド — 準備

- [x] 4.1 `frontend` ディレクトリで `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` を実行して依存を追加する
- [x] 4.2 `frontend/src/types/index.ts` の `TagCategory` 型に `sort_order: number` を追加し、`Tag` 型にも `sort_order: number` を追加する
- [x] 4.3 `frontend/src/api/client.ts`（または API クライアントファイル）に `tagCategories.reorder(ids: number[])` と `tags.reorder(ids: number[])` のメソッドを追加する

## 5. フロントエンド — TagsPage ドラッグ実装

- [x] 5.1 `frontend/src/pages/TagsPage.tsx` のカテゴリ一覧を `@dnd-kit/sortable` の `SortableContext` でラップし、カテゴリ行にドラッグハンドル（`GripVertical` アイコン）を追加する（作品用・出演者用の2つの独立リスト）
- [x] 5.2 `frontend/src/pages/TagsPage.tsx` のカテゴリドラッグ終了ハンドラを実装する（楽観的 state 更新 → `tagCategories.reorder()` 呼び出し → エラー時 `reload()`）
- [x] 5.3 `frontend/src/pages/TagsPage.tsx` のタグ表示をピル形式から縦リスト形式に変更し、各タグ行にドラッグハンドルを追加する
- [x] 5.4 `frontend/src/pages/TagsPage.tsx` のタグドラッグ終了ハンドラを実装する（楽観的 state 更新 → `tags.reorder()` 呼び出し → エラー時 `reload()`）
