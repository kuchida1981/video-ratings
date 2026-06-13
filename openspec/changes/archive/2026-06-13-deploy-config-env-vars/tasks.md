## 1. 設定ファイル（etc/）の更新

- [x] 1.1 `etc/env.example` に `BACKEND_PORT`、`NGINX_PORT`、`BASIC_AUTH_ENABLED`、`BASIC_AUTH_USER`、`BASIC_AUTH_PASSWORD` を追加する
- [x] 1.2 `etc/nginx.conf` の `listen` ポートを `${NGINX_PORT}` に変更し、proxy_pass の 8000 を `${BACKEND_PORT}` に変更する
- [x] 1.3 `etc/nginx.conf` に `include /etc/nginx/snippets/video-ratings-auth.conf;` ディレクティブを追加する
- [x] 1.4 `etc/video-ratings.service` に `Environment=BACKEND_PORT=8000` を追加し、`--port 8000` を `--port ${BACKEND_PORT}` に変更する

## 2. install.sh の更新

- [x] 2.1 `envsubst` コマンドの存在確認を追加し、なければエラーで終了する
- [x] 2.2 `.env` 読み込み後に `BACKEND_PORT`、`NGINX_PORT` のデフォルト値（8000、80）を設定する
- [x] 2.3 nginx.conf の `cp` を `envsubst '$NGINX_PORT $BACKEND_PORT' < ... > ...` に置き換える
- [x] 2.4 `/etc/nginx/snippets/` ディレクトリを作成するステップを追加する
- [x] 2.5 `BASIC_AUTH_ENABLED=true` かつ `BASIC_AUTH_PASSWORD` が空の場合にエラー終了するバリデーションを追加する
- [x] 2.6 `BASIC_AUTH_ENABLED` の値に応じて `/etc/nginx/snippets/video-ratings-auth.conf` を生成するロジックを追加する（有効時は htpasswd 生成も含む）

## 3. update.sh の更新

- [x] 3.1 `.env` 読み込み後に `BACKEND_PORT`、`NGINX_PORT` のデフォルト値を設定する
- [x] 3.2 nginx.conf の `cp` を `envsubst '$NGINX_PORT $BACKEND_PORT' < ... > ...` に置き換える（install.sh と同じロジック）
- [x] 3.3 `/etc/nginx/snippets/` の作成と `video-ratings-auth.conf` の生成ロジックを追加する（install.sh と同じロジック）
- [x] 3.4 `BASIC_AUTH_ENABLED=true` かつ `BASIC_AUTH_PASSWORD` が空の場合にエラー終了するバリデーションを追加する

## 4. ドキュメントの更新

- [x] 4.1 `INSTALL.md` の前提条件に `gettext-base`（envsubst 提供）を追加する
- [x] 4.2 `INSTALL.md` の `.env` 設定項目表に新しい変数（ポート設定・Basic認証）を追加し、説明を記載する
