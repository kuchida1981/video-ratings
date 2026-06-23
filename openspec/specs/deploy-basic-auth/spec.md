# Spec: deploy-basic-auth

## Purpose

~~デプロイ時に HTTP Basic認証を環境変数で設定できるようにする機能。~~ **廃止済み** — セッション認証（session-auth）に完全移行。

## Requirements

_すべての要件は session-auth-with-roles change により削除されました。_

### ~~Requirement: Basic認証を環境変数で有効化できる~~
**REMOVED** — セッション認証に完全移行するため、Basic Auth は廃止。`BASIC_AUTH_ENABLED`, `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` 環境変数は不要。
**Migration**: `SECRET_KEY` 環境変数を設定し、`python -m app.cli user create <username> --role editor` でユーザーを作成する。

### ~~Requirement: Basic認証設定が install と update の両方で反映される~~
**REMOVED** — Basic Auth の廃止に伴い、install/update での Basic Auth 設定反映は不要。
**Migration**: セッション認証は `SECRET_KEY` 環境変数と DB の `users` テーブルで管理される。

### ~~Requirement: ヘルスチェックエンドポイントは認証対象外とする~~
**REMOVED** — この要件自体は引き続き有効だが、session-auth capability で再定義。
**Migration**: session-auth spec の同名要件を参照。
