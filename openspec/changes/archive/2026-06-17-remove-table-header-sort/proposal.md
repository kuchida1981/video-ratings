## Why

テーブルの列ヘッダーをクリックしてソートできる機能は、フィルタパネルのソートボタンUIと重複している。2つのソート手段が共存するのは混乱の元であり、ヘッダークリックを廃止してソートUIをフィルタパネルに一本化する。また、出演者テーブルの「合計スコア」列はヘッダークリックでソートできるが、フィルタパネルに対応するボタンがない（廃止すると完全に失われる）ため、先に補完する。

## What Changes

- 出演者一覧フィルタパネルに「合計スコア順」ソートボタンを追加する
- `WorkTable` のヘッダークリックソート機能を廃止する（`SortableHeader` コンポーネント、`sortBy`/`sortDesc`/`onSort` props を削除）
- `PerformerTable` のヘッダークリックソート機能を廃止する（同上）
- `WorksPage` の `handleWorkTableSort` と `WorkTable` への関連 props 渡しを削除する
- `PerformersPage` の `handlePerformerTableSort` と `PerformerTable` への関連 props 渡しを削除する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `list-table-view`: テーブルヘッダーのクリックソートを廃止（SHALL → 削除）
- `performer-list-sort`: 出演者一覧に合計スコア（total_score）によるソートを追加

## Impact

- `frontend/src/components/WorkTable.tsx`
- `frontend/src/components/PerformerTable.tsx`
- `frontend/src/pages/WorksPage.tsx`
- `frontend/src/pages/PerformersPage.tsx`
- `openspec/specs/list-table-view/spec.md`（delta spec でヘッダーソート要件を削除）
- `openspec/specs/performer-list-sort/spec.md`（delta spec で合計スコアソートを追加）
