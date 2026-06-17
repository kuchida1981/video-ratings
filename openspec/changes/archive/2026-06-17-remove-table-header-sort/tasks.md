## 1. 出演者一覧に合計スコア順ボタンを追加

- [ ] 1.1 `PerformersPage.tsx` のソートボタン列に「合計スコア順」ボタンを追加する（`avg_work_score` ボタンの直後、カスタム項目ボタンの直前）
- [ ] 1.2 ボタンのクリックハンドラで `sortBy = "total_score"`, `sortDesc = true`（初回）、同キー再クリックで昇降順反転するよう実装する
- [ ] 1.3 `saveSortState` を呼んで localStorage に保存する

## 2. WorkTable のヘッダークリックソートを廃止

- [ ] 2.1 `WorkTable.tsx` から `sortBy`, `sortDesc`, `onSort` props を削除する
- [ ] 2.2 `SortableHeader` コンポーネント、`SORTABLE_KEYS`、`isSortable`、`handleHeaderClick` を削除する
- [ ] 2.3 `<SortableHeader>` を使っていた箇所をすべて通常の `<th>` に置き換える（スコア・登録日・カスタム列）
- [ ] 2.4 未使用になった `ArrowUp`, `ArrowDown`, `ArrowUpDown` のインポートを削除する

## 3. PerformerTable のヘッダークリックソートを廃止

- [ ] 3.1 `PerformerTable.tsx` から `sortBy`, `sortDesc`, `onSort` props を削除する
- [ ] 3.2 `SortableHeader` コンポーネント、`SORTABLE_KEYS`、`isSortable`、`handleHeaderClick` を削除する
- [ ] 3.3 `<SortableHeader>` を使っていた箇所をすべて通常の `<th>` に置き換える（出演者名・作品数・平均スコア・合計スコア・カスタム列）
- [ ] 3.4 未使用になった `ArrowUp`, `ArrowDown`, `ArrowUpDown` のインポートを削除する

## 4. 親ページの不要コードを削除

- [ ] 4.1 `WorksPage.tsx` の `handleWorkTableSort` 関数を削除する
- [ ] 4.2 `WorksPage.tsx` の `<WorkTable>` から `onSort`, `sortBy`, `sortDesc` props を削除する
- [ ] 4.3 `PerformersPage.tsx` の `handlePerformerTableSort` 関数を削除する
- [ ] 4.4 `PerformersPage.tsx` の `<PerformerTable>` から `onSort`, `sortBy`, `sortDesc` props を削除する
