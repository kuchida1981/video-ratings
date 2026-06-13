## Why

現在は Docker Compose による開発環境のみ存在し、本番環境（Ubuntu 24.04）へのデプロイ手順が存在しない。バージョン管理されたリリースを安全に本番投入し、最小限のアクションで更新できる仕組みを確立する。

## What Changes

- `.github/workflows/release.yml` を新規追加 — タグ push 時にフロントエンドをビルドし、リリースアーカイブを GitHub Release にアタッチ
- リリースアーカイブ内に `scripts/install.sh` を追加 — 初回インストールを自動化
- リリースアーカイブ内に `scripts/update.sh` を追加 — バージョン更新を1コマンドで実行
- リリースアーカイブ内に `etc/video-ratings.service` を追加 — systemd unit テンプレート
- リリースアーカイブ内に `etc/nginx.conf` を追加 — nginx 設定テンプレート
- `INSTALL.md` を新規追加 — 事前要件・初回インストール手順・ロールバック手順

## Capabilities

### New Capabilities

- `release-workflow`: タグ push をトリガーとした GitHub Actions によるリリースアーカイブの自動生成
- `install-script`: 初回インストールを自動化する `install.sh`
- `update-script`: バージョン更新を1コマンドで行う `update.sh`（`video-ratings-update`）
- `deployment-docs`: インストール・ロールバック手順ドキュメント

### Modified Capabilities

（なし）

## Impact

- `.github/workflows/release.yml`: 新規追加
- `scripts/install.sh`, `scripts/update.sh`: リポジトリに新規追加（リリースアーカイブに同梱）
- `etc/video-ratings.service`, `etc/nginx.conf`: リポジトリに新規追加（リリースアーカイブに同梱）
- `INSTALL.md`: リポジトリに新規追加
- 本番サーバーのディレクトリ構造: `/opt/video-ratings/` および `/var/lib/video-ratings/` を新設
- 既存の開発環境（Docker Compose）への影響: なし
