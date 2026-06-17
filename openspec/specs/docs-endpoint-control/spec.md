# Spec: docs-endpoint-control

## Purpose

FastAPI ドキュメントエンドポイント（`/docs`, `/redoc`, `/openapi.json`）の環境別表示制御。本番環境では無効化し、開発環境でのみ利用可能にする。

## Requirements

### Requirement: 本番環境ではドキュメントエンドポイントを無効化する
`DEBUG=false`（デフォルト）のとき、FastAPI のドキュメント系エンドポイント（`/docs`, `/redoc`, `/openapi.json`）は無効でなければならない（SHALL）。これらのパスにアクセスした場合、404 を返さなければならない（SHALL）。

#### Scenario: 本番環境で /docs にアクセスする
- **WHEN** `DEBUG=false` の状態で `/docs` にリクエストを送る
- **THEN** HTTP 404 が返る

#### Scenario: 本番環境で /redoc にアクセスする
- **WHEN** `DEBUG=false` の状態で `/redoc` にリクエストを送る
- **THEN** HTTP 404 が返る

#### Scenario: 本番環境で /openapi.json にアクセスする
- **WHEN** `DEBUG=false` の状態で `/openapi.json` にリクエストを送る
- **THEN** HTTP 404 が返る

### Requirement: 開発環境ではドキュメントエンドポイントを利用可能にする
`DEBUG=true` のとき、FastAPI のドキュメント系エンドポイント（`/docs`, `/redoc`, `/openapi.json`）は利用可能でなければならない（SHALL）。

#### Scenario: 開発環境で /docs にアクセスする
- **WHEN** `DEBUG=true` の状態で `/docs` にリクエストを送る
- **THEN** Swagger UI が表示される（HTTP 200）

#### Scenario: 開発環境で /openapi.json にアクセスする
- **WHEN** `DEBUG=true` の状態で `/openapi.json` にリクエストを送る
- **THEN** OpenAPI スキーマ JSON が返される（HTTP 200）
