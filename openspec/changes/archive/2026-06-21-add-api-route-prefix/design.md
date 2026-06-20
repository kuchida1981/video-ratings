## Context

フロントエンド (React + React Router) とバックエンド (FastAPI) が同一オリジンで配信される本番環境において、`/works` や `/performers` といったパスが API ルートと SPA ルートの両方に存在する。FastAPI のルート解決は登録順に行われ、API ルーターが SPAStaticFiles より先に登録されているため、ブラウザリロード時に API の JSON レスポンスが返される。

ローカル開発では Vite dev server がフロントエンドを配信し、`/api` prefix を strip して backend に転送する proxy 構成のため、この衝突が発生しない。

### 現在のルーター構成

| ルーター | prefix | 主なパス |
|---------|--------|---------|
| search | `/works/search` | `GET /works/search` |
| works | `/works` | `GET /works`, `GET /works/{id}`, ... |
| performers | `/performers` | `GET /performers`, ... |
| tags | (なし) | `/tag-categories/*`, `/tags/*` |
| custom_fields | `/custom-field-definitions` | `GET /custom-field-definitions`, ... |
| imports | `/import` | `POST /import/preview`, `POST /import/execute` |
| data | (なし) | `GET /export`, `POST /import` |
| health | (なし、直接定義) | `GET /health` |

## Goals / Non-Goals

**Goals:**
- API ルートとフロントエンドルートの名前空間を分離し、SPA リロード問題を解消する
- ローカル開発と本番で同じ API パスが使われるようにする

**Non-Goals:**
- API バージョニング（`/api/v1/...` 等）の導入
- `/health` エンドポイントの認証動作変更
- SPA 配信メカニズム（SPAStaticFiles）自体の変更

## Decisions

### 1. `include_router` に `prefix="/api"` を追加する（個別ルーターの prefix は変更しない）

`main.py` の `app.include_router()` 呼び出しに `prefix="/api"` を渡す。個別ルーターファイルの `APIRouter(prefix=...)` はそのまま維持する。

**理由**: 変更箇所が `main.py` の1ファイルに集約される。個別ルーターは相対パスのみを持ち、マウントポイントは `main.py` が決定するという責務分離が明確になる。

**代替案**: 個別ルーターの prefix を変更する → 変更ファイルが多く、各ルーターが自身の絶対パスを知る必要がある。

### 2. `/health` は `/api/health` に移動する

`/health` を `include_router` と同様に `/api` 配下に移動する。basic_auth_middleware の免除パスも `/api/health` に更新する。

**理由**: Docker Compose の healthcheck は DB (`pg_isready`) にのみ設定されており、backend の healthcheck は外部参照なし。統一性を優先する。

### 3. Vite proxy の rewrite を削除する

```js
// Before
"/api": { target: "http://backend:8000", rewrite: (p) => p.replace(/^\/api/, "") }

// After
"/api": { target: "http://backend:8000" }
```

**理由**: バックエンドが直接 `/api/...` パスを処理するため、strip は不要になる。これにより、ローカル開発と本番で同じパスが使われる。

### 4. `/static/covers` のマウントパスは変更しない

カバー画像の配信パスは `/static/covers` のまま維持する。

**理由**: これは API ではなく静的ファイル配信であり、フロントエンドが `<img src="/static/covers/...">` で参照している。SPA ルートとの衝突もない。

## Risks / Trade-offs

- **[テストのパス更新]** → `test_auth.py` で `/works` や `/health` を直接参照しているテストを `/api/works`、`/api/health` に更新する必要がある。影響範囲は限定的。
- **[外部ヘルスチェック参照]** → もし外部監視サービスが `/health` を参照している場合は更新が必要。→ 現状 Docker Compose の healthcheck は DB のみのため影響なし。
