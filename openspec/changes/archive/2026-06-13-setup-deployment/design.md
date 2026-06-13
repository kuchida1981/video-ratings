## Context

現在はローカル開発用の Docker Compose のみ存在し、本番デプロイの仕組みがない。本番環境は Ubuntu 24.04（実際には systemd-nspawn コンテナ）。サーバーには Python3・pip・PostgreSQL・nginx を事前インストール済みとする。Node.js / npm / uv はサーバーに不要とする。

## Goals / Non-Goals

**Goals:**
- タグ push → GitHub Actions → リリースアーカイブ自動生成 → GitHub Release への自動アタッチ
- 初回インストールを `install.sh` で自動化
- バージョン更新を `video-ratings-update [version]` の1コマンドで完結
- ロールバックをドキュメントで明示

**Non-Goals:**
- ゼロダウンタイムデプロイ（systemctl restart で一瞬停止を許容）
- 複数サーバーへの同時デプロイ
- Docker を使った本番運用

## Decisions

**サーバーディレクトリ構造: capistrano スタイルの releases/ + current symlink**

```
/opt/video-ratings/
├── releases/
│   ├── v1.0.0/
│   │   ├── backend/
│   │   ├── frontend/dist/
│   │   ├── requirements.txt
│   │   └── .venv/
│   └── v1.1.0/
└── current -> releases/v1.1.0/   ← symlink

/var/lib/video-ratings/
├── .env                           ← 永続設定（バージョン横断）
└── uploads/                       ← アップロードファイル（バージョン横断）
```

ロールバックが `ln -sfn releases/v1.0.0 current && systemctl restart video-ratings` で済む。代替案（上書き展開）はロールバックが困難なため不採用。

**Python 依存: requirements.txt を GitHub Actions で生成し同梱**

`uv export --frozen --no-dev -o requirements.txt` をリリース時に実行してアーカイブに含める。サーバー側は `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` のみで済む。uv をサーバーにインストールする必要がない。

**PostgreSQL 自動作成: `.env` の `POSTGRES_PASSWORD` の有無で分岐**

`install.sh` 実行前に `POSTGRES_PASSWORD` が設定済みなら既存 DB 使用（手動作成済みとみなす）。未設定なら `openssl rand -base64 16` でパスワードを生成し、`sudo -u postgres createuser / createdb` を実行して `.env` に書き込む。

**update.sh の自己更新**

更新の都度、新しいアーカイブ内の `scripts/update.sh` を `/usr/local/bin/video-ratings-update` に上書きコピーする。スクリプト自身のバージョンもアプリと同期される。

**nginx 構成**

```
location / {
    root /opt/video-ratings/current/frontend/dist;
    try_files $uri $uri/ /index.html;
}
location /api/ {
    proxy_pass http://127.0.0.1:8000;
}
```

フロントエンド静的ファイルを nginx が直配信することで uvicorn の負荷を減らす。

**systemd unit のユーザー**

専用システムユーザー `video-ratings` で uvicorn を起動する。root では動かさない。

## Risks / Trade-offs

- [`.env` 設定漏れ] install.sh が `.env` 編集を促した後に Enter を待つが、設定不備でも続行できてしまう → alembic が失敗するためインストールが止まり、再実行で対処できる
- [古いリリースのディスク蓄積] releases/ に複数バージョンが溜まる → 定期的な手動削除が必要（初期段階ではスクリプト化しない）
- [GitHub API レートリミット] `latest` 解決で curl が GitHub API を叩く → 認証なしで 60 req/hour、個人運用では問題にならない

## Migration Plan

初回のみ手動展開が必要:
```
curl -L .../v1.0.0/video-ratings-v1.0.0.tar.gz | tar xz
cd video-ratings-v1.0.0
sudo ./scripts/install.sh
```

以後の更新:
```
sudo video-ratings-update          # latest
sudo video-ratings-update v1.2.0   # バージョン指定
```

ロールバック:
```
sudo ln -sfn /opt/video-ratings/releases/v1.0.0 /opt/video-ratings/current
sudo systemctl restart video-ratings
```
