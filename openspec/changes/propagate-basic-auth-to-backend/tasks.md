## 1. nginx 設定の更新

- [ ] 1.1 `etc/nginx.conf` の `/api/` ブロックに `proxy_set_header Authorization $http_authorization;` を追加する

## 2. バックエンド設定の拡張

- [ ] 2.1 `backend/app/config.py` の `Settings` クラスに `basic_auth_enabled: bool = False`・`basic_auth_user: str = ""`・`basic_auth_password: str = ""` フィールドを追加する

## 3. 認証ミドルウェアの実装

- [ ] 3.1 `backend/app/main.py` に Basic認証ミドルウェアを追加する（`BASIC_AUTH_ENABLED=false` のときはスキップ、`/health` パスは除外、`secrets.compare_digest` で検証、失敗時は `WWW-Authenticate: Basic realm="Restricted"` ヘッダーつき 401 を返す）

## 4. Docker 環境への対応

- [ ] 4.1 `docker-compose.yml` の `backend` サービスの `environment` に `BASIC_AUTH_ENABLED`・`BASIC_AUTH_USER`・`BASIC_AUTH_PASSWORD` をコメントアウト状態で追記する（開発時は無効・確認時はコメントを外して使う旨をコメントで明示）

## 5. 動作確認

- [ ] 5.1 Docker 環境でデフォルト状態（`BASIC_AUTH_ENABLED` コメントアウト）のまま `docker compose up` を実行し、`http://localhost:8000/api/works` に認証なしでアクセスできることを確認する
- [ ] 5.2 `docker-compose.yml` の `BASIC_AUTH_ENABLED=true`・`BASIC_AUTH_USER=admin`・`BASIC_AUTH_PASSWORD=secret` のコメントを外して `docker compose up --build` を実行し、以下を確認する:
  - `curl -i http://localhost:8000/api/works` → HTTP 401 が返ること
  - `curl -i -u admin:secret http://localhost:8000/api/works` → HTTP 200 が返ること
  - `curl -i http://localhost:8000/health` → 認証なしで HTTP 200 が返ること（ヘルスチェック除外）
- [ ] 5.3 確認後、`docker-compose.yml` の `BASIC_AUTH_*` 変数を再度コメントアウトに戻す
