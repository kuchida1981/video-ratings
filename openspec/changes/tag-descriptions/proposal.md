## Why

タグカテゴリとタグが何を意味するかを補足するヒントを入力できないため、特にタグ数が増えてきたときに用途が分かりにくくなる。説明フィールドを追加することで、タグ編集時のガイダンスとして機能させる。

## What Changes

- `tag_categories` テーブルに `description` カラム (TEXT, NULL可) を追加
- `tags` テーブルに `description` カラム (TEXT, NULL可) を追加
- タグカテゴリの作成・編集フォームに説明入力欄を追加
- タグの作成・編集フォームに説明入力欄を追加
- タグ管理画面でカテゴリをデフォルト展開状態にする
- 作品・出演者のタグ編集ダイアログで、カテゴリ説明をカテゴリ名の横に表示
- 作品・出演者のタグ編集ダイアログで、タグにホバーしたとき説明をツールチップ表示

## Capabilities

### New Capabilities
- `tag-descriptions`: タグカテゴリおよびタグへの説明フィールドの管理と表示

### Modified Capabilities
- `tag-category-editing`: カテゴリ作成・編集フォームに description フィールドが追加される

## Impact

- **DB**: Alembicマイグレーション 002 (additive, 既存データへの影響なし)
- **Backend**: `backend/app/models/models.py`, `backend/app/schemas/tag.py`, `backend/app/routers/tags.py`
- **Frontend**: `frontend/src/pages/TagsPage.tsx`, 作品詳細・出演者詳細のタグ編集コンポーネント
- **Breaking changes**: なし
