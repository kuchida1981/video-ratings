# Spec: backend-spa-serving

## Purpose

FastAPI が SPA 静的ファイル (frontend/dist) を配信する機能。環境変数 `FRONTEND_DIR` で配信ディレクトリを指定し、全リソースを Basic認証ミドルウェアの保護下に置く。

## Requirements

### Requirement: FRONTEND_DIR が設定されている場合に SPA を配信する
`FRONTEND_DIR` 環境変数にディレクトリパスが設定されている場合、FastAPI SHALL そのディレクトリの静的ファイルをルートパス (`/`) で配信しなければならない。SPA ルーティングのため、存在しないパスへのリクエストは `index.html` にフォールバックしなければならない。

#### Scenario: SPA のルートにアクセスする
- **WHEN** `FRONTEND_DIR` が有効なディレクトリに設定された状態で、認証済みユーザーが `/` にアクセスする
- **THEN** `index.html` が返される

#### Scenario: SPA のサブルートにアクセスする
- **WHEN** `FRONTEND_DIR` が有効なディレクトリに設定された状態で、認証済みユーザーが `/works/1` にアクセスする
- **THEN** SPA ルーティングのため `index.html` が返される

#### Scenario: JS/CSS 等の静的アセットにアクセスする
- **WHEN** `FRONTEND_DIR` が有効なディレクトリに設定された状態で、認証済みユーザーが `/assets/index-abc123.js` にアクセスする
- **THEN** 該当するファイルが返される

### Requirement: FRONTEND_DIR が未設定の場合は SPA 配信をスキップする
`FRONTEND_DIR` 環境変数が空または未設定の場合、FastAPI SHALL SPA 静的ファイルのマウントをスキップしなければならない。これにより開発環境で Vite dev server との競合を回避する。

#### Scenario: FRONTEND_DIR 未設定で API にアクセスする
- **WHEN** `FRONTEND_DIR` が未設定の状態で `/works` にアクセスする
- **THEN** 通常通り API レスポンスが返される

### Requirement: SPA 配信は API およびカバー画像ルートと競合しない
SPA のマウントは API ルーター (`/works`, `/performers` 等) およびカバー画像 (`/static/covers`) より低い優先度で動作しなければならない (SHALL)。

#### Scenario: API エンドポイントが SPA より優先される
- **WHEN** `FRONTEND_DIR` が設定された状態で、認証済みユーザーが `/works` に JSON リクエストを送る
- **THEN** API ルーターが処理し、JSON レスポンスが返される

#### Scenario: カバー画像が SPA より優先される
- **WHEN** `FRONTEND_DIR` が設定された状態で、認証済みユーザーが `/static/covers/image.webp` にアクセスする
- **THEN** カバー画像ファイルが返される

### Requirement: SPA 配信も Basic認証の保護下にある
`BASIC_AUTH_ENABLED=true` の場合、SPA 静的ファイルへのリクエストも認証が必要でなければならない (SHALL)。

#### Scenario: 未認証で SPA にアクセスする
- **WHEN** `BASIC_AUTH_ENABLED=true` かつ `FRONTEND_DIR` が設定された状態で、認証なしで `/` にアクセスする
- **THEN** HTTP 401 が返り、`WWW-Authenticate: Basic` ヘッダーが含まれる
