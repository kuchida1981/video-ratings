## 1. DBマイグレーション

- [ ] 1.1 `backend/alembic/versions/002_add_descriptions.py` を作成し、`tag_categories.description` (TEXT NULL) と `tags.description` (TEXT NULL) を追加する

## 2. バックエンド

- [ ] 2.1 `backend/app/models/models.py` の `TagCategory` と `Tag` に `description` カラムを追加する
- [ ] 2.2 `backend/app/schemas/tag.py` の TagCategory / Tag 関連スキーマに `description: str | None` を追加する
- [ ] 2.3 `backend/app/routers/tags.py` のタグカテゴリ作成・更新エンドポイントで `description` を受け付ける
- [ ] 2.4 `backend/app/routers/tags.py` のタグ作成・更新エンドポイントで `description` を受け付ける

## 3. フロントエンド — 型定義

- [ ] 3.1 `frontend/src/types/index.ts` の `TagCategory` と `Tag` に `description: string | null` を追加する

## 4. フロントエンド — タグ管理画面

- [ ] 4.1 `TagsPage.tsx` でカテゴリロード後に全カテゴリIDを `expanded` の初期値として設定し、デフォルト展開にする
- [ ] 4.2 カテゴリ作成ダイアログに `description` 入力欄を追加し、API呼び出しに含める
- [ ] 4.3 カテゴリ編集インラインフォームに `description` 入力欄を追加し、API呼び出しに含める
- [ ] 4.4 タグ追加フォームに `description` 入力欄を追加し、API呼び出しに含める
- [ ] 4.5 タグ編集インラインフォームに `description` 入力欄を追加し、API呼び出しに含める

## 5. フロントエンド — タグ編集ダイアログ（作品・出演者）

- [ ] 5.1 作品詳細・出演者詳細のタグ編集ダイアログで、カテゴリ説明がある場合にカテゴリ名の横に薄いサブテキストとして表示する
- [ ] 5.2 タグ編集ダイアログ内のタグ要素に `description` があるときホバーでツールチップを表示する（description が null/空の場合はなし）
