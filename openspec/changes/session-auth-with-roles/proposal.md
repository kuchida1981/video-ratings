## Why

現在の認証は HTTP Basic Auth で、2つの根本的な制約がある。(1) ブラウザネイティブの認証ダイアログを使うためサーバー側でセッションタイムアウトを制御できない（タブを閉じるまで永続）。(2) ユーザーが環境変数で1組だけ定義されるため、閲覧のみ・編集可能といったロール分離ができない。セッションベースの認証と認可の仕組みに移行し、これらの制約を解消する。

## What Changes

- Basic Auth ミドルウェアを Cookie ベースのセッション認証に置き換える
- ログイン/ログアウト/セッション確認の認証 API エンドポイントを追加する
- ユーザーテーブル（username, password_hash, role）を DB に追加する
- ユーザー管理用の CLI ツールを提供する（create / list / set-role / reset-password / delete）
- 2時間のアイドルタイムアウトを実装する（サーバー: Cookie 有効期限制御、フロントエンド: プロアクティブ検知）
- viewer / editor のロールベース認可を追加する（viewer は GET のみ、editor は全操作）
- フロントエンドにログインページ、AuthContext、タイムアウト検知を追加する
- **BREAKING**: Basic Auth 方式（`BASIC_AUTH_ENABLED`, `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` 環境変数）を廃止する

## Capabilities

### New Capabilities
- `session-auth`: Cookie ベースのセッション認証（ログイン/ログアウト/タイムアウト）とユーザー管理 CLI
- `role-based-access`: viewer / editor のロールベース認可（API レベル + フロントエンド UI 制御）

### Modified Capabilities
- `deploy-basic-auth`: Basic Auth を廃止し、セッション認証に完全移行する。環境変数による Basic Auth 設定は不要になる。

## Impact

- **Backend**: `app/main.py` のミドルウェア書き換え、新規モジュール追加（`app/auth.py`, `app/cli.py`）、Alembic マイグレーション（users テーブル）
- **Frontend**: ログインページ新規作成、AuthContext 追加、全ページでの認可制御（編集 UI の表示/非表示）、タイムアウト検知
- **Dependencies**: `itsdangerous`（Cookie 署名）、`bcrypt`（パスワードハッシュ）、`click` or `typer`（CLI）の追加
- **API**: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` の新規エンドポイント
- **Deploy**: Basic Auth の環境変数が不要になる代わりに、`SECRET_KEY` 環境変数が必要になる。初回デプロイ時に CLI でユーザーを作成する手順が加わる
