#!/bin/bash
set -euo pipefail

# ---- 定数 ----
REPO="kuchida1981/video-ratings"
BASE_DIR="/opt/video-ratings"
DATA_DIR="/var/lib/video-ratings"
ENV_FILE="$DATA_DIR/.env"
APP_USER="video-ratings"

# root 確認
if [ "$(id -u)" -ne 0 ]; then
    echo "エラー: sudo で実行してください" >&2
    exit 1
fi

# ---- バージョン解決 ----
VERSION="${1:-latest}"

if [ "$VERSION" = "latest" ]; then
    echo "GitHub API で最新バージョンを確認中..."
    VERSION="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
               | grep '"tag_name"' | head -1 | cut -d'"' -f4)"
    if [ -z "$VERSION" ]; then
        echo "エラー: 最新バージョンの取得に失敗しました" >&2
        exit 1
    fi
fi

echo "=== video-ratings アップデーター ==="
echo "バージョン : $VERSION"
echo ""

ARCHIVE_NAME="video-ratings-${VERSION}.tar.gz"
ARCHIVE_URL="https://github.com/${REPO}/releases/download/${VERSION}/${ARCHIVE_NAME}"
RELEASE_DIR="$BASE_DIR/releases/$VERSION"

# 既に同バージョンが展開済みの場合はスキップ
if [ -d "$RELEASE_DIR" ]; then
    echo "  → $RELEASE_DIR は既に存在します。スキップします"
else
    # ---- アーカイブのダウンロードと展開 ----
    echo "[1/5] アーカイブをダウンロード中..."
    TMP_DIR="$(mktemp -d)"
    trap 'rm -rf "$TMP_DIR"' EXIT

    curl -fsSL -o "$TMP_DIR/$ARCHIVE_NAME" "$ARCHIVE_URL"
    echo "  → ダウンロード完了"

    echo "[2/5] 展開中..."
    tar -xzf "$TMP_DIR/$ARCHIVE_NAME" -C "$TMP_DIR"
    EXTRACTED_DIR="$TMP_DIR/video-ratings-${VERSION}"

    mkdir -p "$RELEASE_DIR"
    cp -r "$EXTRACTED_DIR/backend" "$RELEASE_DIR/"
    cp -r "$EXTRACTED_DIR/frontend" "$RELEASE_DIR/"
    cp "$EXTRACTED_DIR/requirements.txt" "$RELEASE_DIR/"

    # ---- Python 仮想環境 ----
    echo "[3/5] Python 仮想環境の構築..."
    python3 -m venv "$RELEASE_DIR/.venv"
    "$RELEASE_DIR/.venv/bin/pip" install --quiet --upgrade pip
    "$RELEASE_DIR/.venv/bin/pip" install --quiet -r "$RELEASE_DIR/requirements.txt"
    echo "  → 完了"

    chown -R "$APP_USER:$APP_USER" "$RELEASE_DIR"
fi

# ---- alembic マイグレーション ----
echo "[4/5] データベースマイグレーション..."
(
    set -a
    source "$ENV_FILE"
    set +a
    cd "$RELEASE_DIR/backend"
    "$RELEASE_DIR/.venv/bin/alembic" upgrade head
)
echo "  → 完了"

# ---- symlink 更新・サービス再起動 ----
echo "[5/5] サービスを更新して再起動..."
ln -sfn "$RELEASE_DIR" "$BASE_DIR/current"
systemctl restart video-ratings
echo "  → 完了"

# ---- 自己更新 ----
if [ -f "$TMP_DIR/video-ratings-${VERSION}/scripts/update.sh" ]; then
    cp "$TMP_DIR/video-ratings-${VERSION}/scripts/update.sh" /usr/local/bin/video-ratings-update
    chmod +x /usr/local/bin/video-ratings-update
fi

echo ""
echo "=== アップデート完了 ==="
echo "バージョン    : $VERSION"
echo "サービス状態  : $(systemctl is-active video-ratings)"
