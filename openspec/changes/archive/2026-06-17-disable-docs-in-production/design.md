## Context

FastAPI はデフォルトで `/docs`（Swagger UI）、`/redoc`（ReDoc）、`/openapi.json`（OpenAPI スキーマ）を公開する。現在 `main.py` の `FastAPI()` 初期化ではこれらを制御しておらず、すべての環境で有効になっている。

`config.py` の `Settings` は `pydantic_settings` を使い `.env` から設定を読み込むパターンが確立されている。

## Goals / Non-Goals

**Goals:**
- 本番環境でドキュメント系エンドポイントを無効化する
- 開発環境では引き続きドキュメントを利用可能にする
- 既存の設定パターンに沿った実装にする

**Non-Goals:**
- 認証ミドルウェアの変更（本番では endpoint 自体が存在しなくなるため不要）
- ドキュメントのカスタマイズ（Swagger UI のテーマ変更等）

## Decisions

### `debug` フラグで環境を判定する

`Settings` に `debug: bool = False` を追加し、`DEBUG=true` 環境変数で開発環境を判定する。

**理由**: `ENV=production` のような文字列ベースの環境名を導入するより、bool フラグの方がシンプル。このプロジェクトでは開発/本番の2環境のみであり、staging 等の中間環境は存在しない。

**代替案**:
- `DOCS_ENABLED=true/false` のような専用フラグ — 今回の用途には十分だが、将来的に debug 的な振る舞いが他にも出てきた場合に個別フラグが増える。`debug` の方が汎用性がある
- `ENV=development/production` 文字列 — 2環境しかない現状ではオーバースペック

### FastAPI 初期化時に条件分岐する

`debug=False` のとき `docs_url=None, redoc_url=None, openapi_url=None` を渡す。`debug=True` のときはデフォルト値（`/docs`, `/redoc`, `/openapi.json`）をそのまま使う。

**理由**: FastAPI の公式にサポートされた無効化方法であり、ミドルウェアやルーティングでの制御より単純で確実。

## Risks / Trade-offs

- **[本番で docs が必要になった場合]** → `DEBUG=true` に設定し再起動するだけで有効化できる。コード変更不要
- **[debug フラグの意味の拡大]** → 現時点では docs 制御のみに使用。将来的に debug 用途が増えた場合も自然に拡張できる
