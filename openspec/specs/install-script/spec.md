# Install Script Spec

## Purpose

新規サーバー環境へのアプリケーションのインストール、必要な依存パッケージやサービスの設定、DBの作成といった初回セットアップ手順を自動化するスクリプトを提供する。

## Requirements

### Requirement: install.sh で初回インストールを自動化できる
`scripts/install.sh` を実行することで、初回セットアップ（ユーザー作成・ディレクトリ作成・Python 環境構築・DB 初期化・systemd/nginx 設定・サービス起動）を自動完了しなければならない（SHALL）。

#### Scenario: install.sh の正常実行
- **WHEN** `sudo ./scripts/install.sh` を実行する
- **THEN** システムユーザー `video-ratings` が作成され、`/opt/video-ratings/` と `/var/lib/video-ratings/uploads/` が作成され、Python venv が構築され、DB が初期化され、サービスが起動する

### Requirement: .env 編集を促す対話ステップを含む
install.sh は `.env.example` をコピーして `/var/lib/video-ratings/.env` を作成した後、ユーザーに編集を促して Enter 待機しなければならない（SHALL）。ユーザーが Enter を押した後に DB 作成・マイグレーションを実行する。

#### Scenario: .env 編集プロンプト
- **WHEN** install.sh が `.env` をコピーした直後
- **THEN** 「`/var/lib/video-ratings/.env` を編集し、設定が完了したら Enter を押してください」と表示して待機する

### Requirement: PostgreSQL DB は自動作成と手動作成の両方に対応する
`POSTGRES_PASSWORD` が `.env` に設定済みの場合は既存 DB を使用し（手動作成済みとみなす）、未設定の場合はパスワードを自動生成して DB とユーザーを作成しなければならない（SHALL）。

#### Scenario: POSTGRES_PASSWORD 未設定時の自動作成
- **WHEN** `.env` に `POSTGRES_PASSWORD` が設定されていない
- **THEN** ランダムパスワードを生成し、`sudo -u postgres` で DB ユーザーと DB を作成し、`.env` にパスワードを書き込む

#### Scenario: POSTGRES_PASSWORD 設定済み時のスキップ
- **WHEN** `.env` に `POSTGRES_PASSWORD` が設定されている
- **THEN** DB 自動作成をスキップし、設定された接続情報で alembic マイグレーションを実行する

### Requirement: install.sh 完了後に video-ratings-update コマンドが使用可能になる
install.sh は `scripts/update.sh` を `/usr/local/bin/video-ratings-update` にコピーしなければならない（SHALL）。

#### Scenario: update コマンドのインストール
- **WHEN** install.sh が正常完了する
- **THEN** `/usr/local/bin/video-ratings-update` が存在し、`sudo video-ratings-update` が実行できる
