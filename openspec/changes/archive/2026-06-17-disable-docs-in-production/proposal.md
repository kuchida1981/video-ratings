## Why

FastAPI のドキュメント系エンドポイント（`/docs`, `/redoc`, `/openapi.json`）は開発時以外ほとんど使われない。本番環境で不要なエンドポイントを公開し続ける理由がないため、本番では無効化し開発環境でのみ利用可能にする。

## What Changes

- `Settings` に `debug` フラグを追加し、環境変数 `DEBUG` で開発/本番を判定する
- `FastAPI()` 初期化時に `debug=False` の場合は `docs_url=None`, `redoc_url=None`, `openapi_url=None` を設定してドキュメント系エンドポイントを無効化する
- `debug=True`（開発環境）ではデフォルト動作を維持し `/docs`, `/redoc`, `/openapi.json` を引き続き利用可能にする

## Capabilities

### New Capabilities

- `docs-endpoint-control`: FastAPI ドキュメントエンドポイントの環境別表示制御

### Modified Capabilities

(なし)

## Impact

- `backend/app/config.py` — `debug` 設定の追加
- `backend/app/main.py` — `FastAPI()` 初期化パラメータの変更
- 本番環境で `/docs`, `/redoc`, `/openapi.json` にアクセスすると 404 になる（**既存の利用者への影響なし** — 使われていないため）
