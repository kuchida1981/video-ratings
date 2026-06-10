## 1. Backend: APIレスポンスにfile_countを追加

- [x] 1.1 `backend/app/schemas/work.py` の `WorkListResponse` に `file_count: int = 0` を追加する
- [x] 1.2 `backend/app/routers/works.py` の `list_works` クエリに `joinedload(Work.files)` を追加する
- [x] 1.3 `list_works` のレスポンス構築部分に `"file_count": len(w.files)` を追加する

## 2. Frontend: 型定義の更新

- [x] 2.1 `frontend/src/types/index.ts` の `WorkListItem` に `file_count: number` を追加する

## 3. Frontend: 作品タイルにファイル数バッジを表示

- [x] 3.1 `frontend/src/components/WorkTile.tsx` に `Files` アイコン（lucide-react）をインポートする
- [x] 3.2 タイル下部のスコア表示行に、`file_count > 0` の場合のみファイル数バッジを追加する（スコアの左側に配置）

## 4. Frontend: ファイルなしフィルタを追加

- [x] 4.1 `frontend/src/pages/WorksPage.tsx` に `onlyNoFiles` ステートを追加する
- [x] 4.2 `filteredWorks` の `useMemo` に `onlyNoFiles` フィルタ条件（`file_count === 0`）を追加する
- [x] 4.3 `hasFilters` の判定に `onlyNoFiles` を追加する
- [x] 4.4 `resetFilters` で `onlyNoFiles` を `false` にリセットする
- [x] 4.5 フィルタバッジ行に「ファイルなし」バッジを追加する（`onlyUnrated`・`onlyNoCover` と同じスタイル）
