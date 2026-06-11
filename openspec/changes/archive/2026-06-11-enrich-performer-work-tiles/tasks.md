## 1. Backend: TagInWorkList に score を追加

- [x] 1.1 `backend/app/schemas/work.py` の `TagInWorkList` に `score: int | None` フィールドを追加する
- [x] 1.2 `backend/app/routers/search.py` のレスポンス構築 dict に `"score": wt.tag.score` を追加する
- [x] 1.3 `backend/app/routers/performers.py` の `get_performer_works` レスポンス構築 dict に `"score": wt.tag.score` を追加する（次タスクで削除するが、整合性のため先に追加）

## 2. Backend: performer_id フィルタを search エンドポイントに追加

- [x] 2.1 `backend/app/routers/search.py` の `search_works` に `performer_id: int | None = Query(None)` パラメータを追加する
- [x] 2.2 `performer_id` が指定された場合に Performer の存在チェック（404）を追加する
- [x] 2.3 `performer_id` フィルタ（`Work.work_performers.any(WorkPerformer.performer_id == performer_id)`）を追加する。必要な import（`Performer`）も確認する

## 3. Backend: 旧エンドポイント削除

- [x] 3.1 `backend/app/routers/performers.py` から `GET /{performer_id}/works` エンドポイント（`get_performer_works` 関数）を削除する
- [x] 3.2 削除後に不要になった import を整理する

## 4. Frontend: 型定義・API クライアント更新

- [x] 4.1 `frontend/src/types/index.ts` の `WorkListItem.tags` の型に `score: number | null` を追加する
- [x] 4.2 `frontend/src/api/client.ts` の `works.search` のパラメータ型に `performer_id?: number` を追加する
- [x] 4.3 `frontend/src/api/client.ts` の `performers.works` メソッドを削除する

## 5. Frontend: WorkTile コンポーネントに variant を追加

- [x] 5.1 `frontend/src/components/WorkTile.tsx` の `WorkTileProps` に `variant?: "compact" | "default"` を追加する（デフォルト `"compact"`）
- [x] 5.2 `variant === "default"` の場合に maker/series 行を表示する（どちらかでも存在する場合のみレンダリング、`/` で結合）
- [x] 5.3 `variant === "default"` の場合にタグバッジ行を表示する（score があれば `+N` サフィックスつき）

## 6. Frontend: PerformerDetailPage の更新

- [x] 6.1 `frontend/src/pages/PerformerDetailPage.tsx` の `api.performers.works(performerId)` 呼び出しを `api.works.search({ performer_id: performerId })` に変更する
- [x] 6.2 queryKey を `["performerWorks", performerId]` のまま維持し、queryFn だけ差し替える
- [x] 6.3 `WorkTile` コンポーネントに `variant="default"` を渡す
