## Why

Basic認証が nginx (htpasswd) と FastAPI ミドルウェアの二重構造になっており、開発環境に nginx がないため認証ロジックのテストができない。開発環境と本番環境の差異を最小化し、認証を testable にする。

## What Changes

- nginx から Basic認証設定を削除し、全リクエストをバックエンドへ proxy するだけの構成に変更
- FastAPI で SPA 静的ファイル (frontend/dist) も配信するようにし、全リソースを認証ミドルウェアの保護下に置く
- デプロイスクリプト (install.sh / update.sh) から htpasswd 生成・nginx auth snippet 生成のロジックを削除
- Docker Compose 開発環境でも Basic認証をデフォルト有効にし、開発時から認証フローをテスト可能にする
- 認証ミドルウェアのユニットテストを追加

## Capabilities

### New Capabilities

- `backend-spa-serving`: FastAPI が SPA 静的ファイル (frontend/dist) を配信する機能。環境変数 `FRONTEND_DIR` で配信ディレクトリを指定し、未設定時はスキップ

### Modified Capabilities

- `deploy-basic-auth`: 認証の責務を nginx から FastAPI に一本化。nginx 側の htpasswd 生成・auth snippet を廃止し、バックエンドミドルウェアのみで認証を担う構成に変更

## Impact

- **backend/app/main.py**: SPA 静的ファイルのマウント追加
- **backend/app/config.py**: `frontend_dir` 設定項目の追加
- **etc/nginx.conf**: Basic認証削除、全リクエスト proxy に簡素化
- **scripts/install.sh, scripts/update.sh**: htpasswd / auth snippet 生成ブロック削除、`FRONTEND_DIR` 設定追加
- **etc/env.example**: `FRONTEND_DIR` 項目追加
- **etc/video-ratings.service**: `FRONTEND_DIR` デフォルト値追加
- **docker-compose.yml**: `BASIC_AUTH_ENABLED=true` をデフォルト有効化
- **backend/tests/**: 認証ミドルウェアのテスト追加
