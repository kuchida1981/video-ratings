## 1. Backend: データモデル変更

- [ ] 1.1 Alembicマイグレーションファイルを作成する（`custom_field_definitions` に `is_sortable BOOLEAN NOT NULL DEFAULT FALSE` を追加）
- [ ] 1.2 `backend/app/models/models.py` の `CustomFieldDefinition` に `is_sortable` カラムを追加する
- [ ] 1.3 `backend/app/schemas/custom_field.py` の `CustomFieldDefinitionResponse` に `is_sortable: bool` を追加する
- [ ] 1.4 `backend/app/schemas/custom_field.py` の `CustomFieldDefinitionCreate` に `is_sortable: bool = False` を追加する
- [ ] 1.5 `backend/app/schemas/custom_field.py` の `CustomFieldDefinitionUpdate` に `is_sortable: bool | None = None` を追加する

## 2. Backend: 検索APIのソート拡張

- [ ] 2.1 `backend/app/routers/search.py` のソートロジックに `custom:` プレフィックス対応を追加する（bool→int変換、nulls last、型別比較）

## 3. Frontend: 型定義更新

- [ ] 3.1 `frontend/src/types/index.ts` の `CustomFieldDefinition` に `is_sortable: boolean` を追加する

## 4. Frontend: カスタム項目設定UI（CustomFieldsPage）

- [ ] 4.1 `CustomFieldsPage.tsx` の `SortableRow` コンポーネントに `is_sortable` トグル（Switch または Checkbox）列を追加する
- [ ] 4.2 `frontend/src/api/client.ts` に `customFields.update(id, data)` メソッドが存在することを確認し、なければ追加する
- [ ] 4.3 トグル操作時に `api.customFields.update(id, { is_sortable })` を呼び出し、queryClient を invalidate する

## 5. Frontend: 作品一覧（WorksPage）

- [ ] 5.1 `WorksPage.tsx` に作品用カスタム項目定義のクエリを追加する（`api.customFields.list("work")`）
- [ ] 5.2 `sortBy` の型を `"created_at" | "total_score" | string` に拡張する
- [ ] 5.3 `is_sortable=true` の作品用カスタム項目を動的にソートボタンとして表示する（既存ボタンと同等スタイル）
- [ ] 5.4 カスタム項目ボタンクリック時のデフォルト方向を field_type に応じて設定する（number/date/boolean: 降順、text: 昇順）
- [ ] 5.5 ソートキーを `custom:<name>` 形式で API に渡す
- [ ] 5.6 localStorage の保存・復元ロジックでカスタム項目ソートキーを扱えるようにする

## 6. Frontend: 出演者一覧（PerformersPage）

- [ ] 6.1 `PerformersPage.tsx` に出演者用カスタム項目定義のクエリを追加する（`api.customFields.list("performer")`）
- [ ] 6.2 `sortBy` の型を拡張し、`is_sortable=true` の出演者用カスタム項目名を受け付けられるようにする
- [ ] 6.3 `is_sortable=true` の出演者用カスタム項目を動的にソートボタンとして表示する
- [ ] 6.4 カスタム項目ボタンクリック時のデフォルト方向を field_type に応じて設定する
- [ ] 6.5 `sortedPerformers` の useMemo にカスタム項目ソートロジックを追加する（`custom:` プレフィックス対応、nulls last）
- [ ] 6.6 localStorage の保存・復元ロジックでカスタム項目ソートキーを扱えるようにする

## 7. Frontend: 出演者詳細ページ（PerformerDetailPage）の作品ソート

- [ ] 7.1 `PerformerDetailPage.tsx` に `sortBy` と `sortDesc` の state を追加する（デフォルト: `"created_at"`, `true`）
- [ ] 7.2 `api.works.search` の呼び出しに `sort_by` と `sort_desc` を渡すよう変更する
- [ ] 7.3 作品用カスタム項目定義のクエリを追加する（`api.customFields.list("work")`）
- [ ] 7.4 作品一覧セクションにソートUIを追加する（「スコア順」「登録日順」＋ is_sortable=true のカスタム項目ボタン）
- [ ] 7.5 カスタム項目ボタンクリック時のデフォルト方向を field_type に応じて設定する
