## Why

現在 Basic認証は nginx レイヤーのみで行われており、バックエンド（FastAPI）は認証なしでアクセス可能な状態にある。同一サーバー上のユーザーや開発環境では nginx を迂回して API に直接到達できるため、認証の実効性が不完全。

## What Changes

- nginx の `/api/` ブロックに `proxy_set_header Authorization` を追加し、Basic認証の Authorization ヘッダーをバックエンドに転送する
- FastAPI にミドルウェアを追加し、`BASIC_AUTH_ENABLED=true` のとき Authorization ヘッダーを検証する（`BASIC_AUTH_ENABLED=false` のときはスキップ）
- `backend/app/config.py` の `Settings` に `BASIC_AUTH_ENABLED`・`BASIC_AUTH_USER`・`BASIC_AUTH_PASSWORD` を追加する
- `docker-compose.yml` にコメントアウト状態で `BASIC_AUTH_*` 変数を記載し、開発時は無効・動作確認時は有効化できるようにする

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `deploy-basic-auth`: Basic認証の保護範囲を nginx レイヤーのみからバックエンド（FastAPI）にも拡張。`BASIC_AUTH_ENABLED=true` のとき、nginx・FastAPI の両方で認証を要求するよう要件を変更する。

## Impact

- `etc/nginx.conf`: `/api/` location ブロックに1行追加
- `backend/app/config.py`: Settings クラスに3フィールド追加
- `backend/app/main.py`: 認証ミドルウェア追加
- `docker-compose.yml`: `backend` サービスの environment にコメントアウトで `BASIC_AUTH_*` 変数を追記
- 既存の nginx レベル認証の動作は変わらない（後方互換あり）
