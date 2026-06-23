## REMOVED Requirements

### Requirement: Basic認証を環境変数で有効化できる
**Reason**: セッション認証に完全移行するため、Basic Auth は廃止する。`BASIC_AUTH_ENABLED`, `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` 環境変数は不要になる。
**Migration**: `SECRET_KEY` 環境変数を設定し、`python -m app.cli user create <username> --role editor` でユーザーを作成する。

### Requirement: Basic認証設定が install と update の両方で反映される
**Reason**: Basic Auth の廃止に伴い、install/update での Basic Auth 設定反映は不要になる。
**Migration**: セッション認証は `SECRET_KEY` 環境変数と DB の `users` テーブルで管理される。

### Requirement: ヘルスチェックエンドポイントは認証対象外とする
**Reason**: この要件自体は引き続き有効だが、session-auth capability で再定義される。deploy-basic-auth からは除去する。
**Migration**: session-auth spec の同名要件を参照。
