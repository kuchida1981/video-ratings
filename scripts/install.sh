#!/bin/bash
set -euo pipefail

# ---- 定数 ----
APP_USER="video-ratings"
BASE_DIR="/opt/video-ratings"
DATA_DIR="/var/lib/video-ratings"
ENV_FILE="$DATA_DIR/.env"

# このスクリプトの親ディレクトリ（アーカイブ展開後のルート）
INSTALL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(basename "$INSTALL_DIR" | sed 's/^video-ratings-//')"
if [ "$VERSION" = "video-ratings" ] || [ -z "$VERSION" ]; then
    VERSION="dev"
fi
RELEASE_DIR="$BASE_DIR/releases/$VERSION"

echo "=== video-ratings インストーラー ==="
echo "バージョン : $VERSION"
echo "インストール先 : $BASE_DIR"
echo ""

# root 確認
if [ "$(id -u)" -ne 0 ]; then
    echo "エラー: sudo で実行してください" >&2
    exit 1
fi

# envsubst 確認
if ! command -v envsubst &>/dev/null; then
    echo "エラー: envsubst が見つかりません。gettext-base をインストールしてください:" >&2
    echo "  sudo apt install gettext-base" >&2
    exit 1
fi

# ---- 1. システムユーザー ----
echo "[1/9] システムユーザー '$APP_USER' の確認..."
if id "$APP_USER" &>/dev/null; then
    echo "  → 既存ユーザーを使用します"
else
    useradd --system --no-create-home --shell /usr/sbin/nologin "$APP_USER"
    echo "  → 作成しました"
fi

# ---- 2. ディレクトリ ----
echo "[2/9] ディレクトリ構造の作成..."
mkdir -p "$BASE_DIR/releases"
mkdir -p "$DATA_DIR/uploads"

# ---- 3. ファイルをリリースディレクトリへコピー ----
echo "[3/9] ファイルを $RELEASE_DIR にコピー..."
mkdir -p "$RELEASE_DIR"
cp -r "$INSTALL_DIR/backend" "$RELEASE_DIR/"
cp -r "$INSTALL_DIR/frontend" "$RELEASE_DIR/"
cp "$INSTALL_DIR/requirements.txt" "$RELEASE_DIR/"

# ---- 4. .env の準備 ----
echo "[4/9] 設定ファイルの準備..."
if [ ! -f "$ENV_FILE" ]; then
    cp "$INSTALL_DIR/etc/env.example" "$ENV_FILE"
    chown "$APP_USER:$APP_USER" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo ""
    echo "============================================================"
    echo " $ENV_FILE を編集して設定を入力してください"
    echo ""
    echo " 必須: SMB_USERNAME, SMB_PASSWORD"
    echo " DB:   POSTGRES_PASSWORD を空のままにすると自動生成します"
    echo "       既存の DB を使う場合は POSTGRES_PASSWORD を設定してください"
    echo "============================================================"
    echo ""
    read -r -p "編集が完了したら Enter を押してください..."
else
    echo "  → 既存の $ENV_FILE を使用します"
fi

# .env を読み込む
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

POSTGRES_USER="${POSTGRES_USER:-video_ratings}"
POSTGRES_DB="${POSTGRES_DB:-video_ratings}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
NGINX_PORT="${NGINX_PORT:-80}"
BASIC_AUTH_ENABLED="${BASIC_AUTH_ENABLED:-false}"

# Basic認証のバリデーション
if [ "$BASIC_AUTH_ENABLED" = "true" ]; then
    if [ -z "${BASIC_AUTH_USER:-}" ] || [ -z "${BASIC_AUTH_PASSWORD:-}" ]; then
        echo "エラー: BASIC_AUTH_ENABLED=true のとき BASIC_AUTH_USER と BASIC_AUTH_PASSWORD を設定してください" >&2
        exit 1
    fi
fi

# ---- 5. PostgreSQL のセットアップ ----
echo "[5/9] PostgreSQL のセットアップ..."
if [ -n "${POSTGRES_PASSWORD:-}" ]; then
    echo "  → POSTGRES_PASSWORD 設定済み。既存 DB を使用します"
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
    # DATABASE_URL を .env に書き込む（未設定の場合）
    if ! grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
    fi
else
    echo "  → パスワードを自動生成して DB を作成します..."
    POSTGRES_PASSWORD="$(openssl rand -base64 16 | tr -d '/+=')"

    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$POSTGRES_USER'" 2>/dev/null | grep -q 1; then
        echo "  → ユーザー '$POSTGRES_USER' は既に存在します"
    else
        sudo -u postgres psql -c "CREATE USER \"$POSTGRES_USER\" WITH PASSWORD '$POSTGRES_PASSWORD';"
        echo "  → ユーザー '$POSTGRES_USER' を作成しました"
    fi

    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'" 2>/dev/null | grep -q 1; then
        echo "  → DB '$POSTGRES_DB' は既に存在します"
    else
        sudo -u postgres createdb -O "$POSTGRES_USER" "$POSTGRES_DB"
        echo "  → DB '$POSTGRES_DB' を作成しました"
    fi

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
    {
        echo "POSTGRES_USER=$POSTGRES_USER"
        echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
        echo "POSTGRES_DB=$POSTGRES_DB"
        echo "DATABASE_URL=$DATABASE_URL"
    } >> "$ENV_FILE"
    echo "  → 接続情報を $ENV_FILE に書き込みました"
fi

# ---- 6. Python 仮想環境 ----
echo "[6/9] Python 仮想環境の構築..."
python3 -m venv "$RELEASE_DIR/.venv"
"$RELEASE_DIR/.venv/bin/pip" install --quiet --upgrade pip
"$RELEASE_DIR/.venv/bin/pip" install --quiet -r "$RELEASE_DIR/requirements.txt"
echo "  → 完了"

# ---- 7. alembic マイグレーション ----
echo "[7/9] データベースマイグレーション..."
(
    set -a
    source "$ENV_FILE"
    set +a
    cd "$RELEASE_DIR/backend"
    "$RELEASE_DIR/.venv/bin/alembic" upgrade head
)
echo "  → 完了"

# ---- 8. systemd / nginx ----
echo "[8/9] systemd unit と nginx 設定のインストール..."

cp "$INSTALL_DIR/etc/video-ratings.service" /etc/systemd/system/
systemctl daemon-reload
echo "  → systemd unit をインストールしました"

# nginx 設定：テンプレート変数を展開してインストール
mkdir -p /etc/nginx/snippets
export NGINX_PORT BACKEND_PORT
envsubst '$NGINX_PORT $BACKEND_PORT' < "$INSTALL_DIR/etc/nginx.conf" \
    > /etc/nginx/sites-available/video-ratings

# Basic認証スニペットの生成
if [ "$BASIC_AUTH_ENABLED" = "true" ]; then
    HTPASSWD_FILE="/etc/nginx/.video-ratings.htpasswd"
    echo "${BASIC_AUTH_USER}:$(openssl passwd -apr1 -stdin <<< "${BASIC_AUTH_PASSWORD}")" \
        > "$HTPASSWD_FILE"
    chmod 640 "$HTPASSWD_FILE"
    chown root:www-data "$HTPASSWD_FILE"
    printf 'auth_basic "Restricted";\nauth_basic_user_file %s;\n' \
        "$HTPASSWD_FILE" > /etc/nginx/snippets/video-ratings-auth.conf
    echo "  → Basic認証を有効化しました"
else
    echo "# Basic auth disabled" > /etc/nginx/snippets/video-ratings-auth.conf
fi

rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/video-ratings /etc/nginx/sites-enabled/video-ratings
nginx -t
systemctl reload nginx
echo "  → nginx 設定をインストールしました"

# ---- 9. symlink・サービス起動 ----
echo "[9/9] シンボリックリンクの作成とサービス起動..."
chown -R "$APP_USER:$APP_USER" "$RELEASE_DIR"
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"
ln -sfn "$RELEASE_DIR" "$BASE_DIR/current"

systemctl enable video-ratings
systemctl start video-ratings

# update.sh を /usr/local/bin に配置
cp "$INSTALL_DIR/scripts/update.sh" /usr/local/bin/video-ratings-update
chmod +x /usr/local/bin/video-ratings-update

echo ""
echo "=== インストール完了 ==="
echo "バージョン    : $VERSION"
echo "サービス状態  : $(systemctl is-active video-ratings)"
echo ""
echo "今後のバージョン更新:"
echo "  sudo video-ratings-update            # 最新バージョンに更新"
echo "  sudo video-ratings-update 1.2.0      # バージョン指定"
