## Why

本番環境でバックエンドが SPA を配信する際、`/works` や `/performers` などのフロントエンドルートと同名の API ルートが衝突し、ブラウザリロード時に React UI ではなく JSON データが返される。ローカル開発では Vite dev server が SPA fallback を担うためこの問題が発生せず、本番でしか再現できない。API ルートに `/api` prefix を付与して名前空間を分離することで、根本的に衝突を解消する。

## What Changes

- バックエンドの全 API ルーターに `/api` prefix を追加（`/works` → `/api/works`, `/performers` → `/api/performers` 等）
- `/health` エンドポイントも `/api/health` に移動（API の一部として統一）
- `/static/covers` マウントパスは変更なし（静的ファイル配信であり API ではない）
- Vite dev server の proxy 設定から `/api` strip の rewrite を削除（バックエンドが直接 `/api/...` パスを処理するため不要になる）
- **BREAKING**: バックエンドの全 API エンドポイントパスが変更される（ただしフロントエンドは既に `/api` prefix を使用しているため、実質的な影響はない）

## Capabilities

### New Capabilities

(なし)

### Modified Capabilities

- `backend-spa-serving`: API ルートが `/api` prefix 配下に移動することで、SPA ルートとの競合解消メカニズムが「優先度ベース」から「名前空間分離」に変更される

## Impact

- **バックエンド**: `main.py` のルーター登録部分、テストの API パス参照
- **フロントエンド**: `vite.config.ts` の proxy 設定のみ（`client.ts` は既に `/api` prefix を使用済み）
- **Docker/デプロイ**: ヘルスチェックが `/health` → `/api/health` に変更される場合、`docker-compose.yml` や外部監視設定の更新が必要
