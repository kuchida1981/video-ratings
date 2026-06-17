## 1. バックエンド: SPA 配信機能の追加

- [x] 1.1 `backend/app/config.py` に `frontend_dir: str = ""` 設定項目を追加
- [x] 1.2 `backend/app/main.py` で `FRONTEND_DIR` が設定されている場合に `StaticFiles(directory=FRONTEND_DIR, html=True)` を `/` にマウント（既存ルーターより後に配置）

## 2. バックエンド: 認証ミドルウェアのテスト追加

- [x] 2.1 `backend/tests/test_auth.py` を作成し、認証ミドルウェアのテストを追加（未認証→401、正しいcredentials→200、不正credentials→401、/health→認証スキップ）

## 3. nginx: pure reverse proxy に簡素化

- [x] 3.1 `etc/nginx.conf` から Basic認証の include を削除し、全リクエストをバックエンドへの単一 proxy に変更

## 4. デプロイスクリプト: nginx 認証ロジック削除・FRONTEND_DIR 追加

- [x] 4.1 `scripts/install.sh` から htpasswd 生成・auth snippet 生成ブロックを削除し、`FRONTEND_DIR` を systemd の環境変数またはサービス設定に追加
- [x] 4.2 `scripts/update.sh` から htpasswd 生成・auth snippet 生成ブロックを削除
- [x] 4.3 `etc/env.example` に `FRONTEND_DIR` の項目を追加
- [x] 4.4 `etc/video-ratings.service` に `FRONTEND_DIR` のデフォルト値を追加

## 5. Docker Compose: 開発環境の認証有効化

- [x] 5.1 `docker-compose.yml` で `BASIC_AUTH_ENABLED=true`、`BASIC_AUTH_USER`、`BASIC_AUTH_PASSWORD` をデフォルト有効に変更
