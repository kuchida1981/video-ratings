## Context

本番デプロイは nginx + uvicorn (systemd) のベアメタル構成。設定の源泉は `/var/lib/video-ratings/.env` で、install.sh / update.sh がこれを読み込んで各サービスを設定する。

現状の問題点：
- `etc/nginx.conf` のポート（80, 8000）がハードコード → nginx は環境変数を直接読めないため、単純な変数化ができない
- `etc/video-ratings.service` の `--port 8000` がハードコード → systemd はEnvironmentFile経由で変数展開が可能
- Basic認証の仕組みがない

## Goals / Non-Goals

**Goals:**
- `BACKEND_PORT` / `NGINX_PORT` を `.env` で設定できる
- `BASIC_AUTH_ENABLED` / `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` を `.env` で設定できる
- install.sh / update.sh の実行で設定が自動反映される
- デフォルト値（BACKEND_PORT=8000, NGINX_PORT=80）で従来通り動作する

**Non-Goals:**
- Docker Compose 環境へのポート設定（開発環境は対象外）
- HTTPS / TLS 終端
- ユーザーごとの認証（単一 user/password のみ）

## Decisions

### 1. nginx のポート設定に envsubst を使う

nginx.conf は環境変数を直接読めないため、install.sh / update.sh で `envsubst` を使ってテンプレート展開してからコピーする。

```bash
envsubst '$NGINX_PORT $BACKEND_PORT' < etc/nginx.conf \
    > /etc/nginx/sites-available/video-ratings
```

**なぜ変数を明示列挙するか**: nginx config 内の `$uri`、`$host`、`$remote_addr` 等を誤って展開しないため。`envsubst '$VAR1 $VAR2'` 形式なら指定した変数のみ置換される。

**代替案**: テンプレートファイルを別名（nginx.conf.template）にする案もあったが、install/update.sh でそのまま扱えるため同名のままとする。

**依存パッケージ**: `envsubst` は `gettext-base` パッケージが提供する。Ubuntu 24.04 では通常プリインストール済みだが、INSTALL.md に明記する。

### 2. systemd service は EnvironmentFile の変数展開を利用する

systemd は `EnvironmentFile` を読み込んだ後、`ExecStart` 内の `${VAR}` を展開する。

```ini
Environment=BACKEND_PORT=8000           # デフォルト値
EnvironmentFile=/var/lib/video-ratings/.env  # .env で上書き
ExecStart=... uvicorn ... --port ${BACKEND_PORT}
```

`Environment=` でデフォルト値を定義し、`EnvironmentFile=` がそれを上書きする順序にする。systemd はバッシュ形式の `${VAR:-default}` をサポートしないため、この方法でデフォルト値を扱う。

### 3. Basic認証は nginx include スニペット方式

nginx.conf に `include /etc/nginx/snippets/video-ratings-auth.conf;` を追加し、install.sh が認証設定または空ファイルを生成する。

```
BASIC_AUTH_ENABLED=false → スニペットが空（認証なし）
BASIC_AUTH_ENABLED=true  → スニペットに auth_basic + auth_basic_user_file 設定
```

**なぜ include 方式か**: nginx.conf のテンプレートを1本に保ちつつ、認証の有無をスニペットで制御できる。auth_basic_user_file が存在しない状態で nginx を起動するとエラーになるため、スニペットの有無で安全に切り替えられる。

**htpasswd の生成**: `openssl passwd -apr1` を使用（openssl は既存の依存関係）。追加パッケージ不要。

```bash
echo "${BASIC_AUTH_USER}:$(openssl passwd -apr1 "${BASIC_AUTH_PASSWORD}")" \
    > /etc/nginx/.video-ratings.htpasswd
```

## Risks / Trade-offs

- **envsubst の未インストール** → `gettext-base` が入っていない環境で install.sh が失敗する。INSTALL.md の前提条件に追記し、install.sh でコマンド存在確認を行う。
- **nginx.conf 内 $ 変数の誤展開** → envsubst に変数名を明示列挙することで回避済み。ただし将来 nginx.conf に新しい変数を追加した際は明示列挙も更新が必要。
- **update.sh がポート/認証設定を再生成しない** → 現状の update.sh は nginx.conf を直接 cp しているため、変更が必要。update.sh でも同じ envsubst + スニペット生成を実施する。
- **BASIC_AUTH_PASSWORD が空のまま BASIC_AUTH_ENABLED=true** → install.sh で検証してエラー終了する。

## Migration Plan

既存インストール済み環境向け:
1. `.env` に新しい変数を追加（BACKEND_PORT=8000, NGINX_PORT=80, BASIC_AUTH_ENABLED=false）
2. `sudo video-ratings-update <version>` を実行すると nginx.conf と systemd service が更新される
3. デフォルト値を使えば動作変化なし

新規インストールは install.sh が `.env` 編集を促すため、プロンプト時に設定する。

## Open Questions

（なし）
