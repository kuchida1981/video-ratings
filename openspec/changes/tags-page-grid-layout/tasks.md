## 1. DnD ストラテジーの変更

- [ ] 1.1 `rectSortingStrategy` を `@dnd-kit/sortable` からインポートに追加する
- [ ] 1.2 カテゴリ一覧の `SortableContext` の `strategy` を `verticalListSortingStrategy` から `rectSortingStrategy` に変更する（work・performer 両セクション）

## 2. アコーディオン機能の削除

- [ ] 2.1 `expanded` state と `toggle` 関数を削除する
- [ ] 2.2 `useEffect`（初期展開処理）を削除する
- [ ] 2.3 カテゴリヘッダーの `ChevronDown` / `ChevronRight` アイコンとクリックで折りたたむ処理を削除する
- [ ] 2.4 `expanded.has(cat.id)` による条件付きレンダリングを廃止し、タグリストを常時表示にする
- [ ] 2.5 不要になった `ChevronDown`, `ChevronRight` の import を削除する

## 3. グリッドレイアウトへの変更

- [ ] 3.1 各セクションのカテゴリリスト（`<div className="space-y-2">`）を `grid grid-cols-2 gap-4 items-start` に変更する
- [ ] 3.2 `SortableItem` のラッパー div がカードとして正しく機能するか確認し、必要であれば高さ・widthを調整する
