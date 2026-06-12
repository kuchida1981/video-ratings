## Why

作品一覧・出演者一覧から詳細ページへ遷移してブラウザバックで戻ると、スクロール位置がページ先頭にリセットされる。多数のアイテムを順に確認する作業でそのたびに目的の位置まで再スクロールが必要となり、作業性を損なっている。

## What Changes

- カスタムフック `useScrollRestoration(key)` を新規作成する
- `WorksPage` にスクロール位置の保存・復元を追加する
- `PerformersPage` にスクロール位置の保存・復元を追加する

## Capabilities

### New Capabilities

- `scroll-position-restoration`: 一覧ページ（WorksPage・PerformersPage）でブラウザバック時にスクロール位置を復元する機能

### Modified Capabilities

（なし）

## Impact

- 新規ファイル: `frontend/src/hooks/useScrollRestoration.ts`
- 変更ファイル: `frontend/src/pages/WorksPage.tsx`, `frontend/src/pages/PerformersPage.tsx`
- 外部依存の追加なし
- APIへの影響なし
