## 1. 型定義・共通ユーティリティ

- [ ] 1.1 `WorkColumnKey` / `PerformerColumnKey` 型を `frontend/src/types/index.ts` に追加する
- [ ] 1.2 作品テーブル用の列設定ロード・保存関数を WorksPage に追加する（localStorage キー: `video-ratings:works-table-columns`、デフォルト: `["maker", "total_score"]`）
- [ ] 1.3 出演者テーブル用の列設定ロード・保存関数を PerformersPage に追加する（localStorage キー: `video-ratings:performers-table-columns`、デフォルト: `["work_count", "avg_work_score"]`）

## 2. WorkTable コンポーネント

- [ ] 2.1 `frontend/src/components/WorkTable.tsx` を新規作成する（props: works, visibleColumns, customFieldDefs, sortBy, sortDesc, onSort, onRowClick）
- [ ] 2.2 最小列（タイトル・出演者名）を常に表示する実装を追加する
- [ ] 2.3 選択可能列（メーカー・シリーズ・スコア・タグ・ファイル数・登録日・カスタム項目）を visibleColumns に基づいて表示する実装を追加する
- [ ] 2.4 boolean型カスタム項目を ✓ / — で表示する
- [ ] 2.5 ソート可能列ヘッダー（スコア・登録日・ソータブルなカスタム項目）に ArrowUpDown アイコンを表示し、クリックで onSort を呼ぶ実装を追加する
- [ ] 2.6 テーブル行クリックで onRowClick を呼ぶ実装を追加する

## 3. PerformerTable コンポーネント

- [ ] 3.1 `frontend/src/components/PerformerTable.tsx` を新規作成する（props: performers, visibleColumns, customFieldDefs, sortBy, sortDesc, onSort, onRowClick）
- [ ] 3.2 最小列（出演者名・ふりがな）を常に表示する実装を追加する（ふりがな未設定は「—」）
- [ ] 3.3 選択可能列（作品数・作品平均スコア・合計スコア・タグ・カスタム項目）を visibleColumns に基づいて表示する実装を追加する
- [ ] 3.4 ソート可能列ヘッダー（名前・作品数・作品平均スコア・ソータブルなカスタム項目）に ArrowUpDown アイコンを表示し、クリックで onSort を呼ぶ実装を追加する
- [ ] 3.5 テーブル行クリックで onRowClick を呼ぶ実装を追加する

## 4. WorksPage の更新

- [ ] 4.1 `viewMode` state（`"tile" | "table"`、デフォルト `"tile"`）を追加する
- [ ] 4.2 `visibleWorkColumns` state（デフォルト `["maker", "total_score"]`、localStorage から復元）を追加する
- [ ] 4.3 ヘッダー右端にタイル/テーブル切り替えトグルアイコン（LayoutGrid / List）を追加する
- [ ] 4.4 フィルタパネル内に列選択バッジUI（テーブル表示時のみ表示）を追加する。バッジクリックで列の表示/非表示を切り替え、localStorage に保存する
- [ ] 4.5 コンテンツエリアを `viewMode === "table"` の場合 WorkTable を、それ以外は既存タイルグリッドをレンダリングするよう変更する

## 5. PerformersPage の更新

- [ ] 5.1 `viewMode` state（`"tile" | "table"`、デフォルト `"tile"`）を追加する
- [ ] 5.2 `visiblePerformerColumns` state（デフォルト `["work_count", "avg_work_score"]`、localStorage から復元）を追加する
- [ ] 5.3 ヘッダー右端にタイル/テーブル切り替えトグルアイコン（LayoutGrid / List）を追加する
- [ ] 5.4 フィルタパネル内に列選択バッジUI（テーブル表示時のみ表示）を追加する。バッジクリックで列の表示/非表示を切り替え、localStorage に保存する
- [ ] 5.5 コンテンツエリアを `viewMode === "table"` の場合 PerformerTable を、それ以外は既存タイルグリッドをレンダリングするよう変更する
