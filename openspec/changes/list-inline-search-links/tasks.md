## 1. PerformerTable に検索リンクを追加

- [ ] 1.1 `frontend/src/components/PerformerTable.tsx` に `Search` アイコンを import し、`editMode=true` 時に出演者名の横に Google 検索アイコンリンク（`<a href="https://www.google.com/search?q=..." target="_blank">`）を表示する。検索クエリは `"出演者名"` のダブルクォート囲み形式。アイコンサイズは `size={14}`。

## 2. WorkTable に検索リンクを追加

- [ ] 2.1 `frontend/src/components/WorkTable.tsx` に `Search` アイコンを import し、`editMode=true` 時にタイトルの横に Google 検索アイコンリンクを表示する。検索クエリは `"出演者1" "出演者2" "タイトル"` の形式（詳細ページと同等）。アイコンサイズは `size={14}`。
