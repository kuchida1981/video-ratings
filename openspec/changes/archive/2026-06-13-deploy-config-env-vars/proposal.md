## Why

本番デプロイ（nginx + uvicorn/systemd のベアメタル構成）において、ポート番号がハードコードされているため、開発中によく使う 8000番・5173番ポートと衝突しやすい。また、外部公開時の Basic認証をオプションとして用意したい。

## What Changes

- `BACKEND_PORT` 環境変数でバックエンド（uvicorn）のポートを指定できるようにする（デフォルト: 8000）
- `NGINX_PORT` 環境変数で nginx のリッスンポートを指定できるようにする（デフォルト: 80）
- `BASIC_AUTH_ENABLED` / `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` 環境変数で Basic認証を有効化・設定できるようにする
- すべての設定は `/var/lib/video-ratings/.env` で管理する

## Capabilities

### New Capabilities

- `deploy-port-config`: バックエンドと nginx のポート番号を環境変数で設定する機能
- `deploy-basic-auth`: nginx レイヤーで Basic認証を有効化・無効化する機能

### Modified Capabilities

（なし）

## Impact

- `etc/env.example`: 新しい環境変数を追加
- `etc/nginx.conf`: `${NGINX_PORT}` / `${BACKEND_PORT}` のテンプレート変数化、Basic認証 include ディレクティブ追加
- `etc/video-ratings.service`: デフォルト値定義と `${BACKEND_PORT}` 変数化
- `scripts/install.sh`: envsubst によるテンプレート展開、htpasswd 生成ロジック追加
- `scripts/update.sh`: 同上（更新時も設定を再生成）
- `INSTALL.md`: 新しい設定項目のドキュメント追加
