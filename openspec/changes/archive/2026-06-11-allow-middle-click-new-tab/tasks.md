## 1. タイルコンポーネントの Link 化

- [x] 1.1 `WorkTile` を `Link` コンポーネントを使用するように修正する (`frontend/src/components/WorkTile.tsx`)
- [x] 1.2 `PerformerTile` を `Link` コンポーネントを使用するように修正する (`frontend/src/components/PerformerTile.tsx`)
- [x] 1.3 `WorksPage` (`frontend/src/pages/WorksPage.tsx`) における `WorkTile` の `onClick` を削除し、動作確認を行う
- [x] 1.4 `PerformersPage` (`frontend/src/pages/PerformersPage.tsx`) における `PerformerTile` の `onClick` を削除し、動作確認を行う

## 2. テーブルコンポーネント内のタイトル・出演者名の Link 化

- [x] 2.1 `WorkTable` 内のタイトル部分を `Link` に置き換え、ホバー時のアンダーライン等スタイルを調整する (`frontend/src/components/WorkTable.tsx`)
- [x] 2.2 `PerformerTable` 内の出演者名部分を `Link` に置き換え、ホバー時のアンダーライン等スタイルを調整する (`frontend/src/components/PerformerTable.tsx`)
- [x] 2.3 `WorksPage` (`frontend/src/pages/WorksPage.tsx`) における `WorkTable` の `onRowClick` を削除し、動作確認を行う
- [x] 2.4 `PerformersPage` (`frontend/src/pages/PerformersPage.tsx`) における `PerformerTable` の `onRowClick` を削除し、動作確認を行う
- [x] 2.5 テーブルの行（`tr`）に対して付与されている行全体のホバーエフェクトやクリック遷移処理を削除し、スタイルの微調整を行う
