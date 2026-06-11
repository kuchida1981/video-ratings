## Why

各ページコンポーネントで `useEffect + useState + 手動fetch` というボイラープレートが繰り返されており、ミューテーション後の再フェッチも手動管理になっている。TanStack Query を導入することで、この冗長性を排除しデータフェッチロジックを宣言的に記述できるようにする。

## What Changes

- `@tanstack/react-query` を依存に追加し、`QueryClientProvider` をアプリルートに配置する
- 各ページの `useEffect + useState` フェッチパターンを `useQuery` に置き換える
- CRUD 操作を `useMutation + queryClient.invalidateQueries` に置き換える（手動での再フェッチ呼び出しを廃止）
- `WorksPage.tsx` のインポートフロー関連 useState 7つを `useImportFlow` カスタムフックに切り出す

## Capabilities

### New Capabilities

- `tanstack-query-setup`: QueryClient の初期化と QueryClientProvider のセットアップ
- `works-data-fetching`: Works 一覧・詳細フェッチと CRUD ミューテーションの useQuery/useMutation 化
- `performers-data-fetching`: Performers 一覧・詳細フェッチと CRUD ミューテーションの useQuery/useMutation 化
- `import-flow-hook`: WorksPage のインポートフロー状態を `useImportFlow` カスタムフックに切り出す

### Modified Capabilities

<!-- なし（APIの形・機能要件は変わらない） -->

## Impact

- `frontend/package.json`: `@tanstack/react-query` 追加
- `frontend/src/main.tsx` または `App.tsx`: QueryClientProvider 追加
- `frontend/src/pages/WorksPage.tsx`: useQuery/useMutation 化 + useImportFlow 切り出し
- `frontend/src/pages/PerformersPage.tsx`, `PerformerDetailPage.tsx`, `WorkDetailPage.tsx` 等: useQuery/useMutation 化
- `frontend/src/hooks/useImportFlow.ts`: 新規作成
- API の形（エンドポイント・レスポンス形式）は変更しない
