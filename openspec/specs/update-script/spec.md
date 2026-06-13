# Update Script Spec

## Purpose

すでに稼働しているサーバー上のアプリケーションを指定されたバージョン、または最新リリースバージョンへ自動で更新し、DBのマイグレーションやサービスの再起動を行うスクリプトを提供する。

## Requirements

### Requirement: video-ratings-update で1コマンドでバージョン更新できる
`video-ratings-update` コマンドは、引数なしで最新リリース、引数ありで指定バージョンへの更新を実行しなければならない（SHALL）。更新は「アーカイブ取得・展開・依存インストール・マイグレーション・サービス再起動」を自動完了する。

#### Scenario: 引数なしで latest に更新
- **WHEN** `sudo video-ratings-update` を引数なしで実行する
- **THEN** GitHub API から最新リリースのタグを取得し、そのバージョンへの更新を完了してサービスを再起動する

#### Scenario: バージョン指定で更新
- **WHEN** `sudo video-ratings-update v1.2.0` を実行する
- **THEN** v1.2.0 のアーカイブをダウンロードし、更新を完了してサービスを再起動する

### Requirement: update.sh は自己更新する
更新完了時、`/usr/local/bin/video-ratings-update` を新しいアーカイブ内の `scripts/update.sh` で上書きしなければならない（SHALL）。

#### Scenario: スクリプト自己更新
- **WHEN** `video-ratings-update` が正常完了する
- **THEN** `/usr/local/bin/video-ratings-update` が新しいバージョンのスクリプトに差し替えられている
