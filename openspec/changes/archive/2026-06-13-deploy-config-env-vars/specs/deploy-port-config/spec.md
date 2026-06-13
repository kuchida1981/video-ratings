## ADDED Requirements

### Requirement: バックエンドポートを環境変数で設定できる
システムは `.env` の `BACKEND_PORT` を参照し、uvicorn がリッスンするポート番号として使用しなければならない（SHALL）。未設定の場合は 8000 をデフォルト値とする。`BACKEND_PORT` の値は nginx の proxy_pass ターゲットポートにも反映されなければならない（SHALL）。

#### Scenario: BACKEND_PORT を指定して起動する
- **WHEN** `.env` に `BACKEND_PORT=18000` を設定してインストール/更新を実行する
- **THEN** uvicorn が 18000 番ポートでリッスンし、nginx が `proxy_pass http://127.0.0.1:18000/` でバックエンドに接続する

#### Scenario: BACKEND_PORT を指定しない場合のデフォルト動作
- **WHEN** `.env` に `BACKEND_PORT` が設定されていない状態でインストール/更新を実行する
- **THEN** uvicorn が 8000 番ポートでリッスンし、従来と同じ動作をする

### Requirement: nginx ポートを環境変数で設定できる
システムは `.env` の `NGINX_PORT` を参照し、nginx がリッスンするポート番号として使用しなければならない（SHALL）。未設定の場合は 80 をデフォルト値とする。

#### Scenario: NGINX_PORT を指定して起動する
- **WHEN** `.env` に `NGINX_PORT=18080` を設定してインストール/更新を実行する
- **THEN** nginx が 18080 番ポートでリッスンし、ブラウザから `http://<host>:18080/` でアクセスできる

#### Scenario: NGINX_PORT を指定しない場合のデフォルト動作
- **WHEN** `.env` に `NGINX_PORT` が設定されていない状態でインストール/更新を実行する
- **THEN** nginx が 80 番ポートでリッスンし、従来と同じ動作をする

### Requirement: ポート設定が install と update の両方で反映される
install.sh と update.sh のどちらを実行しても、`.env` の `BACKEND_PORT` / `NGINX_PORT` が nginx と systemd service に反映されなければならない（SHALL）。

#### Scenario: インストール時にポート設定が反映される
- **WHEN** `.env` にポート設定を記入してから `install.sh` を実行する
- **THEN** 生成された `/etc/nginx/sites-available/video-ratings` と `/etc/systemd/system/video-ratings.service` に設定が反映されている

#### Scenario: 更新時にポート設定が反映される
- **WHEN** `.env` のポート設定を変更してから `video-ratings-update` を実行する
- **THEN** nginx と systemd service が新しいポートで動作する
