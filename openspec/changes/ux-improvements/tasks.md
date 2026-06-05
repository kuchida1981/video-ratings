## 1. バックエンド: 作品一覧の全件返し・出演者追加

- [ ] 1.1 `app/schemas/work.py` の `WorkListResponse` に `performers: list[PerformerNameOnly]` フィールドを追加（`PerformerNameOnly` は id と name のみの軽量スキーマ）
- [ ] 1.2 `app/routers/search.py` のページングスライス（`start = (page-1)*page_size` と `result[start:start+page_size]`）を削除して全件返すように変更
- [ ] 1.3 `app/routers/search.py` のレスポンス構築に performers フィールドを追加（`WorkPerformer` からの出演者名リスト）

## 2. バックエンド: 出演者一覧に出演作数追加

- [ ] 2.1 `app/schemas/performer.py` の `PerformerResponse` に `work_count: int` フィールドを追加
- [ ] 2.2 `app/routers/performers.py` の `list_performers` で `joinedload(Performer.work_performers)` を追加
- [ ] 2.3 `app/routers/performers.py` の `_build_performer_response` に `work_count: len(p.work_performers)` を追加

## 3. フロントエンド: 型の更新

- [ ] 3.1 `frontend/src/types/index.ts` の `WorkListItem` に `performers: { id: number; name: string }[]` フィールドを追加
- [ ] 3.2 `frontend/src/types/index.ts` の `Performer` に `work_count: number` フィールドを追加

## 4. フロントエンド: 作品一覧テーブルの更新

- [ ] 4.1 `frontend/src/pages/WorksPage.tsx` のテーブルヘッダーに「出演者」列を先頭に追加し、列順を「出演者・作品名・メーカー・シリーズ・スコア・登録日」に変更
- [ ] 4.2 `frontend/src/pages/WorksPage.tsx` の各行に出演者列を追加（カンマ区切り表示、0名は「—」）
- [ ] 4.3 `frontend/src/pages/WorksPage.tsx` の空件数メッセージの `colSpan` を 6 に更新

## 5. フロントエンド: 出演者一覧テーブルの更新

- [ ] 5.1 `frontend/src/pages/PerformersPage.tsx` のテーブルに「出演作数」列を追加
- [ ] 5.2 `frontend/src/pages/PerformersPage.tsx` の空件数メッセージの `colSpan` を 4 に更新

## 6. フロントエンド: タグカテゴリ編集UIの追加

- [ ] 6.1 `frontend/src/pages/TagsPage.tsx` にカテゴリ編集用のステート（`editingCatId`, `editCatName`, `editCatMulti`）を追加
- [ ] 6.2 `frontend/src/pages/TagsPage.tsx` にカテゴリ更新関数 `updateCategory` を追加（`api.tagCategories.update()` を呼ぶ）
- [ ] 6.3 `frontend/src/pages/TagsPage.tsx` のカテゴリ行ヘッダーに鉛筆アイコンボタンを追加
- [ ] 6.4 `frontend/src/pages/TagsPage.tsx` でカテゴリ編集モード時に名前入力フィールドと複数選択可チェックボックスをインライン表示する（タグ編集の既存パターンを踏襲）
