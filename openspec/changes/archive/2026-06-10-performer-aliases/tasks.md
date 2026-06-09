## 1. データベース

- [x] 1.1 Alembic migration `007_performer_aliases.py` を作成し `performer_aliases` テーブルを定義する（カラム: id, performer_id FK, name, furigana nullable）
- [x] 1.2 `docker compose exec backend alembic upgrade head` で migration を適用する

## 2. バックエンド: モデル・スキーマ

- [x] 2.1 `app/models/models.py` に `PerformerAlias` モデルを追加し、`Performer` モデルに `aliases` リレーションを追加する
- [x] 2.2 `app/schemas/performer.py` に `AliasResponse`（id, name, furigana）、`AliasCreate`（name, furigana）、`AliasUpdate`（name nullable, furigana nullable）スキーマを追加する
- [x] 2.3 `PerformerResponse` に `aliases: list[AliasResponse] = []` フィールドを追加する

## 3. バックエンド: API エンドポイント

- [x] 3.1 `app/routers/performers.py` の `_load_performer` で `aliases` を joinedload するよう修正する
- [x] 3.2 `_build_performer_response` に `aliases` フィールドを追加する
- [x] 3.3 `POST /performers/{performer_id}/aliases` エンドポイントを実装する（名前空の場合は 400 エラー）
- [x] 3.4 `PUT /performers/{performer_id}/aliases/{alias_id}` エンドポイントを実装する（存在しない場合は 404 エラー）
- [x] 3.5 `DELETE /performers/{performer_id}/aliases/{alias_id}` エンドポイントを実装する（存在しない場合は 404 エラー）

## 4. フロントエンド: 型定義・API クライアント

- [x] 4.1 `frontend/src/types/index.ts` の `Performer` 型に `aliases: { id: number; name: string; furigana: string | null }[]` フィールドを追加する
- [x] 4.2 `frontend/src/api/client.ts` に別名 CRUD メソッド（`addAlias`、`updateAlias`、`removeAlias`）を追加する

## 5. フロントエンド: UI

- [x] 5.1 `frontend/src/pages/PerformerDetailPage.tsx` の編集フォームに別名管理セクションを追加する（別名の一覧表示、追加フォーム、編集・削除ボタン）
- [x] 5.2 別名の追加フォームに name・furigana の入力フィールドと追加ボタンを実装する
- [x] 5.3 登録済み別名の各行に編集（インライン）と削除ボタンを実装する
