# インストールガイド

## 事前要件

サーバーに以下のパッケージをインストールしておいてください。

| パッケージ | 最低バージョン | 用途 |
|-----------|---------------|------|
| Python 3 | 3.12 以上 | バックエンド実行環境 |
| pip | 付属版で可 | Python パッケージのインストール |
| PostgreSQL | 14 以上 | データベース |
| nginx | 1.18 以上 | リバースプロキシ・静的ファイル配信 |
| openssl | 付属版で可 | DB パスワードの自動生成・Basic認証に使用 |
| gettext-base | 付属版で可 | nginx 設定のテンプレート展開（envsubst）に使用 |

Ubuntu 24.04 へのインストール例:

```bash
sudo apt install python3 python3-pip python3-venv postgresql nginx openssl gettext-base
```

---

## 初回インストール

### 1. リリースアーカイブのダウンロードと展開

[GitHub Releases](https://github.com/kuchida1981/video-ratings/releases) からアーカイブを取得します。

```bash
VERSION=1.0.0
curl -L "https://github.com/kuchida1981/video-ratings/releases/download/${VERSION}/video-ratings-${VERSION}.tar.gz" \
    -o "video-ratings-${VERSION}.tar.gz"
tar xzf "video-ratings-${VERSION}.tar.gz"
cd "video-ratings-${VERSION}"
```

### 2. install.sh を実行

```bash
sudo ./scripts/install.sh
```

スクリプトは以下の順で処理します:

1. システムユーザー `video-ratings` を作成
2. ディレクトリ `/opt/video-ratings/` と `/var/lib/video-ratings/uploads/` を作成
3. 設定ファイル `/var/lib/video-ratings/.env` を作成 → **編集を求めるプロンプトが表示されます**
4. PostgreSQL DB の作成（`POSTGRES_PASSWORD` が未設定なら自動生成）
5. Python 仮想環境の構築と依存パッケージのインストール
6. データベースマイグレーションの実行
7. systemd unit と nginx 設定のインストール
8. サービスの起動

### 3. .env の設定項目

install.sh の途中で `/var/lib/video-ratings/.env` の編集を求められます。

| 項目 | 説明 |
|------|------|
| `POSTGRES_USER` | DB ユーザー名（デフォルト: `video_ratings`） |
| `POSTGRES_PASSWORD` | DB パスワード。**空のままにすると自動生成されます** |
| `POSTGRES_DB` | DB 名（デフォルト: `video_ratings`） |
| `SMB_USERNAME` | Samba ユーザー名（必須） |
| `SMB_PASSWORD` | Samba パスワード（必須） |
| `UPLOAD_DIR` | アップロードファイルの保存先（デフォルト: `/var/lib/video-ratings/uploads`） |
| `BACKEND_PORT` | バックエンド（uvicorn）のリッスンポート（デフォルト: `8000`） |
| `NGINX_PORT` | nginx のリッスンポート（デフォルト: `80`） |
| `BASIC_AUTH_ENABLED` | Basic認証を有効にする場合は `true`（デフォルト: `false`） |
| `BASIC_AUTH_USER` | Basic認証のユーザー名（`BASIC_AUTH_ENABLED=true` のとき使用） |
| `BASIC_AUTH_PASSWORD` | Basic認証のパスワード（`BASIC_AUTH_ENABLED=true` のとき必須） |

### 4. nginx の server_name 設定（任意）

デフォルトの nginx 設定は `server_name _;`（すべてのホスト名を受け付け）になっています。
特定のホスト名に限定する場合は編集してください:

```bash
sudo nano /etc/nginx/sites-available/video-ratings
# server_name example.com; に変更
sudo nginx -t && sudo systemctl reload nginx
```

---

## Basic認証のユーザー名・パスワード変更

インストール後に認証情報を変更する場合は、以下の手順で行います。

### 1. .env を編集

```bash
sudo nano /var/lib/video-ratings/.env
```

`BASIC_AUTH_USER` および `BASIC_AUTH_PASSWORD` を新しい値に変更してください。

### 2. htpasswd ファイルを再生成して nginx を再読み込み

`.env` の変更は nginx に自動反映されません。以下のコマンドで htpasswd ファイルを更新してください。

```bash
# .env を読み込んで htpasswd を再生成
sudo sh -c '
  set -a
  source /var/lib/video-ratings/.env
  set +a
  echo "${BASIC_AUTH_USER}:$(openssl passwd -apr1 "${BASIC_AUTH_PASSWORD}")" \
    > /etc/nginx/.video-ratings.htpasswd
'
sudo nginx -t && sudo systemctl reload nginx
```

> **補足**: `video-ratings-update` を実行してもこの再生成は行われます。
> バージョン更新と同時に認証情報を変更したい場合は、.env を編集後に `sudo video-ratings-update` を実行してください。

---

## バージョン更新

インストール完了後は `video-ratings-update` コマンドで更新できます。

```bash
# 最新バージョンに更新
sudo video-ratings-update

# バージョンを指定して更新
sudo video-ratings-update 1.2.0
```

更新スクリプトは以下を自動実行します:

1. GitHub からアーカイブをダウンロード
2. `/opt/video-ratings/releases/<version>/` に展開
3. Python 仮想環境を構築
4. データベースマイグレーションを実行
5. `/opt/video-ratings/current` シンボリックリンクを新バージョンに切り替え
6. `video-ratings` サービスを再起動
7. `/usr/local/bin/video-ratings-update` を新バージョンのスクリプトに更新

---

## ロールバック

問題が発生した場合は以下の手順で以前のバージョンに戻せます。

### 1. 展開済みバージョンの確認

```bash
ls /opt/video-ratings/releases/
# 例: 1.0.0  1.1.0  1.2.0
```

### 2. シンボリックリンクを戻す

```bash
sudo ln -sfn /opt/video-ratings/releases/1.1.0 /opt/video-ratings/current
```

### 3. サービスを再起動

```bash
sudo systemctl restart video-ratings
```

### 4. サービス状態の確認

```bash
systemctl status video-ratings
```

> **注意**: データベースのマイグレーションはロールバックされません。
> スキーマの変更が含まれるバージョンへのロールバックは、
> 必要に応じて `alembic downgrade` を手動実行してください:
>
> ```bash
> sudo -u video-ratings bash -c "set -a; source /var/lib/video-ratings/.env; \
>   /opt/video-ratings/releases/1.1.0/.venv/bin/alembic \
>   -c /opt/video-ratings/releases/1.1.0/backend/alembic.ini downgrade -1"
> ```

---

## systemd サービス操作

```bash
sudo systemctl start video-ratings    # 起動
sudo systemctl stop video-ratings     # 停止
sudo systemctl restart video-ratings  # 再起動
sudo systemctl status video-ratings   # 状態確認
sudo journalctl -u video-ratings -f   # ログ確認
```

---

## ディレクトリ構造（参考）

```
/opt/video-ratings/
├── releases/
│   ├── 1.0.0/
│   │   ├── backend/
│   │   ├── frontend/dist/
│   │   ├── requirements.txt
│   │   └── .venv/
│   └── 1.1.0/
└── current -> releases/1.1.0/

/var/lib/video-ratings/
├── .env          ← 設定ファイル（バージョン横断）
└── uploads/      ← アップロード画像（バージョン横断）
```
