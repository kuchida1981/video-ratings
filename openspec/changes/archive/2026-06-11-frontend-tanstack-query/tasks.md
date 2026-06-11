## 1. セットアップ

- [x] 1.1 `docker compose exec frontend npm install @tanstack/react-query` で依存を追加する
- [x] 1.2 `frontend/src/main.tsx` に `QueryClient`（`refetchOnWindowFocus: false`）と `QueryClientProvider` を追加する

## 2. useImportFlow カスタムフック作成

- [x] 2.1 `frontend/src/hooks/useImportFlow.ts` を新規作成し、WorksPage のインポートフロー関連 useState 7つ（importPhase, confirmRowNumbers, importPreview, importRowStates, importResult, importLoading, importDragOver）を移動する
- [x] 2.2 インポート完了時に呼ぶ `onImportComplete` コールバックを引数として受け取るよう設計する
- [x] 2.3 WorksPage でフックを使うよう切り替え、動作を確認する

## 3. WorksPage の useQuery/useMutation 化

- [x] 3.1 works 一覧フェッチを `useQuery(['works', filterParams], ...)` に置き換え、`useCallback + useEffect` の二段構えを削除する
- [x] 3.2 tagCategories フェッチを `useQuery(['tagCategories', 'work'], ...)` に置き換える
- [x] 3.3 Work 作成ミューテーションを `useMutation` に置き換え、`onSuccess` で `['works']` を invalidate する
- [x] 3.4 インポート完了コールバックで `queryClient.invalidateQueries({ queryKey: ['works'] })` を呼ぶ

## 4. WorkDetailPage の useQuery/useMutation 化

- [x] 4.1 work 詳細フェッチを `useQuery(['works', workId], ...)` に置き換え、`reload()` 関数を削除する
- [x] 4.2 tagCategories・performers・customFields の各フェッチを `useQuery` に置き換える
- [x] 4.3 Work 更新・削除を `useMutation` に置き換え、`onSuccess` で `['works', workId]` と `['works']` を invalidate する
- [x] 4.4 タグ・出演者・ファイル・カバー画像の各操作を `useMutation` に置き換える
- [x] 4.5 各 useMutation の `onSuccess` から手動 `reload()` 呼び出しを削除する

## 5. PerformersPage の useQuery/useMutation 化

- [x] 5.1 performers 一覧フェッチを `useQuery(['performers'], ...)` に置き換える
- [x] 5.2 Performer 作成ミューテーションを `useMutation` に置き換え、`onSuccess` で `['performers']` を invalidate する

## 6. PerformerDetailPage の useQuery/useMutation 化

- [x] 6.1 performer 詳細フェッチを `useQuery(['performers', performerId], ...)` に置き換える
- [x] 6.2 tagCategories・customFields の各フェッチを `useQuery` に置き換える
- [x] 6.3 Performer 更新・削除・タグ・エイリアス・カバー画像の各操作を `useMutation` に置き換え、`onSuccess` で `['performers', performerId]` を invalidate する

## 7. その他ページの useQuery 化

- [x] 7.1 `TagsPage`, `CustomFieldsPage`, `SettingsPage` の useEffect フェッチを `useQuery` に置き換える（ミューテーション後の invalidate も追加）
