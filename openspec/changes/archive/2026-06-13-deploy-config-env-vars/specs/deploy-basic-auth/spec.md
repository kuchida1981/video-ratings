## ADDED Requirements

### Requirement: Basic認証を環境変数で有効化できる
`.env` に `BASIC_AUTH_ENABLED=true`、`BASIC_AUTH_USER`、`BASIC_AUTH_PASSWORD` を設定することで、nginx レイヤーで HTTP Basic認証を有効化しなければならない（SHALL）。`BASIC_AUTH_ENABLED=false`（デフォルト）の場合は認証なしで動作しなければならない（SHALL）。

#### Scenario: Basic認証を有効にした状態でインストールする
- **WHEN** `.env` に `BASIC_AUTH_ENABLED=true`、`BASIC_AUTH_USER=admin`、`BASIC_AUTH_PASSWORD=secret` を設定して install.sh を実行する
- **THEN** ブラウザでアクセスすると HTTP 401 が返り、Basic認証ダイアログが表示される

#### Scenario: 正しい認証情報でアクセスする
- **WHEN** Basic認証が有効な状態で、正しいユーザー名とパスワードを入力する
- **THEN** アプリケーションに正常にアクセスできる

#### Scenario: 誤った認証情報でアクセスする
- **WHEN** Basic認証が有効な状態で、誤ったユーザー名またはパスワードを入力する
- **THEN** HTTP 401 が返り、アクセスが拒否される

#### Scenario: Basic認証を無効にした状態で動作する
- **WHEN** `.env` に `BASIC_AUTH_ENABLED=false`（または未設定）でインストール/更新を実行する
- **THEN** 認証なしでアプリケーションにアクセスできる

### Requirement: BASIC_AUTH_PASSWORD が未設定の場合はエラーで停止する
`BASIC_AUTH_ENABLED=true` のとき、`BASIC_AUTH_PASSWORD` が空の場合は install.sh / update.sh がエラーメッセージを表示して終了しなければならない（SHALL）。

#### Scenario: パスワード未設定で有効化しようとする
- **WHEN** `.env` に `BASIC_AUTH_ENABLED=true`、`BASIC_AUTH_PASSWORD=`（空）の状態でインストール/更新を実行する
- **THEN** スクリプトがエラーメッセージを表示して終了し、nginx 設定は変更されない

### Requirement: Basic認証設定が install と update の両方で反映される
install.sh と update.sh のどちらを実行しても、`.env` の Basic認証設定が nginx に反映されなければならない（SHALL）。更新時に認証設定が変更されていれば（有効化・無効化・パスワード変更）、新しい設定で上書きしなければならない（SHALL）。

#### Scenario: 更新時に Basic認証を有効化する
- **WHEN** 以前は `BASIC_AUTH_ENABLED=false` だった `.env` を `BASIC_AUTH_ENABLED=true` に変更して `video-ratings-update` を実行する
- **THEN** 更新後は Basic認証が有効になる

#### Scenario: 更新時に Basic認証を無効化する
- **WHEN** 以前は `BASIC_AUTH_ENABLED=true` だった `.env` を `BASIC_AUTH_ENABLED=false` に変更して `video-ratings-update` を実行する
- **THEN** 更新後は認証なしでアクセスできる
