## Context

現在 Basic認証は nginx (htpasswd) と FastAPI ミドルウェアの二重構造で動作している。開発環境では nginx が存在しないため認証ロジックのテストができず、本番環境との差異が生まれている。FastAPI には既に `basic_auth_middleware` が実装済みで、`BASIC_AUTH_ENABLED` 環境変数で ON/OFF を制御できる。

本番のリクエストフローは現在:
```
Client → nginx (Basic認証 + 静的配信 + proxy) → FastAPI (Basic認証 MW + API)
```

## Goals / Non-Goals

**Goals:**
- 認証ロジックを FastAPI ミドルウェアに一本化し、nginx から認証責務を除去する
- FastAPI で SPA 静的ファイルとカバー画像の両方を配信し、全リソースを認証下に置く
- 開発環境でも認証を有効化し、本番との差異をなくす
- 認証ミドルウェアの pytest テストを追加する

**Non-Goals:**
- カスタムログイン画面の実装（ブラウザネイティブの Basic認証ダイアログを使用）
- セッション管理やトークンベース認証への移行
- TLS 終端の変更（引き続き nginx が担当）

## Decisions

### D1: FastAPI で SPA を配信する (`StaticFiles` + `html=True`)

FastAPI の `StaticFiles(directory=FRONTEND_DIR, html=True)` を使い、SPA の HTML/JS/CSS を配信する。`html=True` により `index.html` へのフォールバックが有効になり、SPA ルーティングが動作する。

- **代替案**: nginx で静的ファイルを配信し続け、認証だけバックエンドに移す → カバー画像は保護できるが HTML/JS が認証なしで公開される。静的ファイルも保護したいという要件を満たせない。
- **代替案**: nginx を完全撤廃し FastAPI を直接公開 → TLS 終端やレート制限で将来困る。

### D2: `FRONTEND_DIR` 環境変数で SPA 配信を制御

- 本番: `FRONTEND_DIR=/opt/video-ratings/current/frontend/dist` を設定 → SPA を FastAPI が配信
- 開発: `FRONTEND_DIR` を未設定 → SPA マウントをスキップ（Vite dev server が配信）
- 未設定時にマウントしないことで、開発環境で Vite の HMR と競合しない

### D3: SPA のマウントパスは `/` にする

本番環境で nginx が `location /` を `proxy_pass` するため、FastAPI 側も `/` で SPA を配信する。`/api/` や `/static/` のルーターが先にマッチし、それ以外のパスが SPA にフォールバックする。

- FastAPI ではルーターが先に登録された順に評価されるため、`app.mount("/", ...)` を最後に配置すれば既存のルーティングと競合しない。

### D4: 開発環境では `BASIC_AUTH_ENABLED=true` をデフォルトにする

docker-compose.yml で `BASIC_AUTH_ENABLED=true` と `BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD` を設定。開発時から本番と同じ認証フローが動作する。

### D5: nginx は pure reverse proxy に簡素化

nginx.conf から Basic認証の include と静的ファイル配信の location を削除。全リクエストを単一の `location /` でバックエンドに proxy する。

## Risks / Trade-offs

- **[静的ファイル配信のパフォーマンス低下]** → uvicorn が HTML/JS/CSS を配信するため nginx 直接配信より遅い。ただしユーザー数が極めて少ない個人プロジェクトのため実質影響なし。
- **[開発環境での認証の煩わしさ]** → docker-compose.yml にデフォルトの credentials を記載するため、開発者は把握している。ブラウザがセッション内で credentials をキャッシュするため毎回の入力は不要。
- **[SPA マウントパスの変更]** → 本番でアクセスする URL パスが変わる可能性がある（現在 nginx が `/` で配信）。FastAPI 側も `/` にマウントするため URL は変わらない。
