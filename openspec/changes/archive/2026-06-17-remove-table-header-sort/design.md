## Context

作品一覧・出演者一覧のテーブル表示には、列ヘッダーをクリックしてソートする機能がある。一方、テーブルの上部フィルタパネルにも同等のソートボタンが存在し、両者は同じ `sortBy`/`sortDesc` state を操作する。重複した操作経路を一本化し、フィルタパネルのソートボタンに統一する。

## Goals / Non-Goals

**Goals:**
- テーブルヘッダーのクリックソート機能を削除する
- 出演者一覧フィルタパネルに「合計スコア順」ボタンを追加し、ヘッダー廃止によるソート手段の消失を防ぐ
- テーブルコンポーネントの不要な props (`sortBy`, `sortDesc`, `onSort`) を削除してシンプルにする

**Non-Goals:**
- ヘッダー以外の列表示・列選択 UI の変更
- タイル表示モードへの影響
- バックエンド API の変更

## Decisions

### WorkTable / PerformerTable から sort 関連 props を削除する

`SortableHeader` コンポーネント、`SORTABLE_KEYS`、`isSortable`、`handleHeaderClick` を完全に削除し、全列ヘッダーを通常の `<th>` に変更する。`ArrowUp`/`ArrowDown`/`ArrowUpDown` アイコンのインポートも除去する。

`sortBy`/`sortDesc`/`onSort` props もインタフェースから削除する。これらを渡している親ページ側でも、対応するハンドラ関数 (`handleWorkTableSort`, `handlePerformerTableSort`) と props 渡しを削除する。

### 出演者一覧に「合計スコア順」ボタンを追加する

`PerformersPage` のソートボタン列に `total_score` 用のボタンを追加する。既存の `work_count`/`avg_work_score` ボタンと同じパターンで実装する（デフォルト降順）。`saveSortState` で localStorage に保存する点も同様。

出演者一覧のソートはクライアントサイドで行われているため、バックエンド変更は不要。

## Risks / Trade-offs

- ヘッダーのアクティブ色（`text-primary`）によるソート状態の視覚的フィードバックが消える → フィルタパネルのボタンが同等の視覚フィードバックを提供しているため問題ない
- `list-table-view` の既存 spec にヘッダークリックソートが SHALL 要件として記述されているため、delta spec での明示的な REMOVED が必要
