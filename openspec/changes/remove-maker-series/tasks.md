## 1. DB マイグレーション

- [ ] 1.1 `backend/alembic/versions/011_remove_maker_series.py` を作成し、`ix_works_maker`・`ix_works_series` インデックスおよび `maker`・`series` カラムを DROP する migration を実装する

## 2. バックエンド: モデル・スキーマ

- [ ] 2.1 `backend/app/models/models.py` の `Work` モデルから `maker` / `series` Column 定義を削除する
- [ ] 2.2 `backend/app/schemas/work.py` の `WorkCreate`・`WorkUpdate`・`WorkResponse` から `maker` / `series` フィールドを削除する
- [ ] 2.3 `backend/app/schemas/search.py` の `SearchParams` から `maker` / `series` フィールドを削除する

## 3. バックエンド: ルーター・サービス

- [ ] 3.1 `backend/app/routers/works.py` のレスポンス dict 組み立てから `maker` / `series` を削除する
- [ ] 3.2 `backend/app/services/work_service.py` の work dict 組み立てから `maker` / `series` を削除する
- [ ] 3.3 `backend/app/routers/search.py` から `maker` / `series` クエリパラメータ・全文検索対象・個別フィルタ処理・レスポンス dict を削除する

## 4. バックエンド: テスト

- [ ] 4.1 `backend/tests/schemas/test_schemas.py` から `maker` を使っているテストケースを修正する

## 5. フロントエンド: 型定義

- [ ] 5.1 `frontend/src/types/index.ts` の `Work` / `WorkCreate` 型から `maker` / `series` フィールドを削除する
- [ ] 5.2 `frontend/src/types/index.ts` の `WorkColumnKey` union から `"maker"` / `"series"` を削除する

## 6. フロントエンド: ページ・コンポーネント

- [ ] 6.1 `frontend/src/pages/WorksPage.tsx` の `DEFAULT_WORKS_TABLE_COLUMNS` を `["total_score"]` に変更する
- [ ] 6.2 `frontend/src/pages/WorksPage.tsx` から `maker` / `series` の state・filter params・作品作成フォーム入力欄・フィルター入力欄・列選択オプションを削除する
- [ ] 6.3 `frontend/src/components/WorkTable.tsx` から `maker` / `series` の列ヘッダー・セルを削除する
- [ ] 6.4 `frontend/src/components/WorkTile.tsx` から `maker` / `series` を使った meta 表示を削除する
- [ ] 6.5 `frontend/src/pages/WorkDetailPage.tsx` から `maker` / `series` の form state・編集フォーム入力欄・詳細表示を削除する

## 7. フロントエンド: テスト

- [ ] 7.1 `frontend/src/api/client.test.ts` から `maker` を使っているテストケースを修正する
