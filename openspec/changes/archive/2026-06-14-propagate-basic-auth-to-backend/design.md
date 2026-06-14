## Context

現在の Basic認証は nginx レイヤーのみで完結している。nginx は htpasswd ファイルで認証を行い、通過したリクエストをそのまま uvicorn（FastAPI）に転送する。FastAPI 側には認証の仕組みがなく、同一サーバー上からや Docker 開発環境では API エンドポイントに直接アクセスできる状態にある。

認証情報（`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`）はすでに `.env` で管理されており、nginx の htpasswd 生成時に使われている。FastAPI 側もこれらの値を環境変数として受け取れる構造なので、追加依存なしで実装できる。

## Goals / Non-Goals

**Goals:**
- `BASIC_AUTH_ENABLED=true` のとき、FastAPI がすべての API リクエストの Authorization ヘッダーを検証し、不正なリクエストを 401 で拒否する
- `BASIC_AUTH_ENABLED=false`（デフォルト）のとき、FastAPI は認証をスキップし、開発・Docker 環境で従来通り動作する
- 既存の nginx レベル認証の動作を変えない

**Non-Goals:**
- セッション管理やトークンベース認証への移行
- API ごとの認可（エンドポイント別のアクセス制御）
- nginx の Basic認証を廃止すること（二重検証は意図的）

## Decisions

### 決定1: nginx → FastAPI への Authorization ヘッダー転送

`etc/nginx.conf` の `/api/` ブロックに `proxy_set_header Authorization $http_authorization;` を追加する。nginx はデフォルトで `Authorization` ヘッダーを upstream に転送するが、明示することで意図を明確にし、将来の nginx 設定変更時の見落としを防ぐ。

### 決定2: FastAPI はミドルウェアで認証を実装する

各ルート/依存関係ではなく、ASGI ミドルウェアとして実装する。理由：
- 全エンドポイントに一括適用できるため、ルート追加時に認証を付け忘れるリスクがない
- `BASIC_AUTH_ENABLED=false` のとき、ミドルウェア自体が何もせずパスするので開発環境への影響がない

依存注入（`Depends(HTTPBasic())`）との比較：依存注入はルートごとに追加が必要で、`/health` などを除外する場合もルート個別対応になり煩雑。ミドルウェアなら除外リストを一箇所で管理できる。

### 決定3: `/health` エンドポイントは認証対象外にする

ヘルスチェック（systemd・Docker の `healthcheck` など）が認証情報なしで呼び出せる必要があるため、ミドルウェアで `/health` パスを除外する。

### 決定4: `secrets.compare_digest` でタイミング攻撃を防ぐ

認証情報の比較は `secrets.compare_digest` を使い、タイミングサイドチャネル攻撃を防ぐ。標準ライブラリのみで実現できるため追加依存なし。

### 決定5: Docker 環境での動作確認方法

`docker-compose.yml` の `backend` サービスの `environment` に `BASIC_AUTH_*` 変数をコメントアウト状態で記載する。動作確認時はコメントを外して `docker compose up --build` を実行することで、開発環境でも認証フローを確認できる。

## Risks / Trade-offs

- **二重検証のズレ** → nginx と FastAPI で同じ `.env` の値を参照するため、`.env` を変更して `update.sh` を実行すれば両方が同期される。ズレのリスクは低い。
- **`/health` 以外の公開エンドポイント追加時** → 将来 `/health` 以外にも認証不要なエンドポイントを追加する場合、ミドルウェアの除外リストを更新する必要がある。除外リストは `main.py` の1箇所に集約するため管理しやすい。

## Migration Plan

1. `etc/nginx.conf` を変更（Authorization ヘッダー転送を明示）
2. `backend/app/config.py` に `BASIC_AUTH_*` フィールドを追加
3. `backend/app/main.py` に認証ミドルウェアを追加
4. `docker-compose.yml` に `BASIC_AUTH_*` 変数をコメントアウトで追記
5. 動作確認（Docker 環境で一時的に有効化してテスト）
6. 本番環境: `video-ratings-update` を実行（nginx 設定再適用 + バックエンド再起動）

**ロールバック**: `main.py` からミドルウェアを削除し、サービスを再起動するだけで元の状態に戻る。nginx 側の変更（Authorization ヘッダーの明示的転送）は nginx が元から転送していたため影響なし。

## Open Questions

（なし）
