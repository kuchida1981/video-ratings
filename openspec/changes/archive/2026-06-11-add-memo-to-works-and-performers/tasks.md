## 1. DB マイグレーション

- [x] 1.1 `008_add_memo_columns.py` を作成し、`works.memo` と `performers.memo` (TEXT, nullable) を追加する
- [x] 1.2 `docker compose exec backend alembic upgrade head` でマイグレーションを適用する

## 2. バックエンド モデル・スキーマ

- [x] 2.1 `backend/app/models/models.py` の `Work` モデルに `memo = Column(Text, nullable=True)` を追加する
- [x] 2.2 `backend/app/models/models.py` の `Performer` モデルに `memo = Column(Text, nullable=True)` を追加する
- [x] 2.3 `backend/app/schemas/work.py` の `WorkBase` / `WorkUpdate` / `WorkResponse` に `memo: str | None = None` を追加する
- [x] 2.4 `backend/app/schemas/performer.py` の `PerformerUpdate` / `PerformerResponse` に `memo: str | None = None` を追加する

## 3. フロントエンド 作品詳細ページ

- [x] 3.1 `frontend/src/pages/WorkDetailPage.tsx` のローカル state に `memo` を追加し、`work.memo` で初期化する
- [x] 3.2 カスタム項目セクションの下にメモセクション（`<Textarea>`）を追加する
- [x] 3.3 `onBlur` で `memo` の値が初期値と異なる場合のみ PATCH `/works/{id}` を送信し、state を更新する

## 4. フロントエンド 出演者詳細ページ

- [x] 4.1 `frontend/src/pages/PerformerDetailPage.tsx` のローカル state に `memo` を追加し、`performer.memo` で初期化する
- [x] 4.2 カスタム項目セクションの下にメモセクション（`<Textarea>`）を追加する
- [x] 4.3 `onBlur` で `memo` の値が初期値と異なる場合のみ PATCH `/performers/{id}` を送信し、state を更新する
