## Why

出演者詳細ページの「出演作品」セクションは作品一覧ページと同じタイル表示を使っているが、出演者1名あたりの作品数は少ない（5〜20件程度）ため、作品一覧の大量表示向け compact なタイルを使うのは情報密度として物足りない。メーカー・シリーズ・タグ（スコア付き）を表示する default バリアントを追加し、出演者詳細ページでより多くの情報を一目で確認できるようにする。

また、`GET /performers/{id}/works` と `GET /works/search` でほぼ同一のレスポンス構築コードが重複しているため、performer_id フィルタを search エンドポイントに統合して重複を解消する。

## What Changes

- **Backend**: `TagInWorkList` スキーマに `score: int | None` フィールドを追加（既存 joinedload で取得済み、追加クエリ不要）
- **Backend**: `GET /works/search` に `performer_id` クエリパラメータを追加
- **Backend BREAKING**: `GET /performers/{id}/works` エンドポイントを削除（search エンドポイントに統合）
- **Frontend**: `WorkListItem.tags` の型に `score: number | null` を追加
- **Frontend**: `api.performers.works()` を廃止し、`api.works.search({ performer_id })` で代替
- **Frontend**: `WorkTile` に `variant?: "compact" | "default"` props を追加
  - `compact`（デフォルト値）: 現行と同じ（WorksPage に影響なし）
  - `default`: maker/series・タグバッジ（score 付き）を追加表示
- **Frontend**: `PerformerDetailPage` の WorkTile に `variant="default"` を指定

## Capabilities

### New Capabilities
- `performer-work-tiles`: 出演者詳細ページにおける出演作品タイルのリッチ表示（maker/series・タグバッジ）

### Modified Capabilities
- `search`: performer_id フィルタの追加、および GET /performers/{id}/works の統合による重複解消
- `works-list-display`: タグレスポンスに score フィールドを追加
- `tile-grid-view`: WorkTile に variant props を追加し、default バリアントではメーカー・シリーズ・タグを表示（現行 compact バリアントの動作は維持）

## Impact

- **backend/app/schemas/work.py**: `TagInWorkList` に score 追加
- **backend/app/routers/search.py**: `performer_id` フィルタ追加
- **backend/app/routers/performers.py**: `GET /{performer_id}/works` 削除
- **frontend/src/types/index.ts**: `WorkListItem.tags` の型更新
- **frontend/src/api/client.ts**: `performers.works` メソッド削除、`works.search` のパラメータ型拡張
- **frontend/src/components/WorkTile.tsx**: `variant` props 追加
- **frontend/src/pages/PerformerDetailPage.tsx**: `variant="default"` 指定、API 呼び出し変更
