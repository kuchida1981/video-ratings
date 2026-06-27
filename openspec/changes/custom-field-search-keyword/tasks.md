## 1. バックエンド: DB・モデル・スキーマ

- [ ] 1.1 Alembic マイグレーション `013_add_is_search_keyword_to_custom_fields.py` を作成する。`custom_field_definitions` テーブルに `is_search_keyword BOOLEAN NOT NULL DEFAULT FALSE` カラムを追加する。最新 revision は `010_coerce_numeric_custom_fields` (または `011_remove_maker_series`)。`ls backend/alembic/versions/` で最新 revision ID を確認してから作成すること
- [ ] 1.2 `backend/app/models/models.py` の `CustomFieldDefinition` クラスに `is_search_keyword = Column(Boolean, nullable=False, default=False)` を追加する
- [ ] 1.3 `backend/app/schemas/custom_field.py` を更新する: `CustomFieldDefinitionCreate` に `is_search_keyword: bool = False` を追加、`CustomFieldDefinitionUpdate` に `is_search_keyword: bool | None = None` を追加、`CustomFieldDefinitionResponse` に `is_search_keyword: bool` を追加する

## 2. バックエンド: ルーター更新

- [ ] 2.1 `backend/app/routers/custom_fields.py` の PATCH エンドポイントで `is_search_keyword` の更新を処理できるよう確認・修正する（`is_sortable` と同パターンで対応できているか確認し、必要なら追加する）

## 3. フロントエンド: 型定義・API クライアント

- [ ] 3.1 `frontend/src/types/index.ts` の `CustomFieldDefinition` インターフェースに `is_search_keyword: boolean` を追加する
- [ ] 3.2 `frontend/src/api/client.ts` の `customFields.update` 呼び出し時の型に `is_search_keyword` が渡せるか確認し、必要なら修正する

## 4. フロントエンド: カスタム項目設定ページ

- [ ] 4.1 `frontend/src/pages/CustomFieldsPage.tsx` の `SortableRow` コンポーネントに「検索に使う」Switch 列を追加する。`is_sortable` の Switch と同パターンで実装する。`field_type !== "text"` の場合は `disabled` にする
- [ ] 4.2 `CustomFieldsPage` のテーブルヘッダーに「検索キーワード」列を追加する（`並べ替えOK` の隣）
- [ ] 4.3 `SortableRow` の `onToggleSearchKeyword` ハンドラを `CustomFieldsPage` から渡し、`updateMutation` で `{ is_search_keyword: checked }` を送信するよう実装する

## 5. フロントエンド: Google 検索クエリ生成ロジック

- [ ] 5.1 `frontend/src/pages/WorkDetailPage.tsx` の Google 検索クエリ生成部分を修正する。`customFields`（work 用定義）から `is_search_keyword === true && field_type === "text"` のものをフィルタし、`work.custom_fields?.[def.name]` の値が非空文字であれば `"${value}"` 形式でクエリ末尾に追加する
- [ ] 5.2 `frontend/src/components/WorkTable.tsx` の Google 検索クエリ生成部分（`editMode` 時のリンク href）を同様に修正する。`customFieldDefs` prop を利用する
- [ ] 5.3 `frontend/src/pages/PerformerDetailPage.tsx` の Google 検索クエリ生成部分を修正する。`customFieldDefs`（performer 用定義）から `is_search_keyword === true && field_type === "text"` のものをフィルタし、`performer.custom_fields?.[def.name]` の値が非空文字であれば `"${value}"` 形式でクエリ末尾に追加する
- [ ] 5.4 `frontend/src/components/PerformerTable.tsx` の Google 検索クエリ生成部分（`editMode` 時のリンク href）を同様に修正する。`customFieldDefs` prop を利用する
