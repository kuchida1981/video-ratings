## Context

現在の認証は `app/main.py` の HTTP ミドルウェアで Basic Auth を実装しており、環境変数 `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` の 1 組のクレデンシャルで全 API を保護している。フロントエンド（React SPA）は認証を一切関知せず、ブラウザネイティブの Basic Auth ダイアログに依存している。

ユーザーモデル・セッション・ロールの概念は存在せず、DB には認証関連のテーブルがない。バックエンドは FastAPI + SQLAlchemy + PostgreSQL、フロントエンドは React + React Router + TanStack Query の構成。

## Goals / Non-Goals

**Goals:**
- セッションタイムアウト（2 時間アイドル）を実現する
- viewer（閲覧のみ）/ editor（編集可能）のロール分離を実現する
- CLI によるユーザー管理（DB にハッシュ化パスワードで保存）
- タイムアウト時にフロントエンドがプロアクティブに検知してログイン画面に遷移する

**Non-Goals:**
- ユーザー登録画面・管理画面の提供（CLI で管理する）
- OAuth2 / OIDC / 外部 IdP 連携
- パスワードリセットのメール送信機能
- Remember me（ログイン状態の永続化）
- セッションの DB 永続化（署名付き Cookie で完結）
- admin ロールやより細かい権限モデル（viewer / editor の 2 ロールに限定）

## Decisions

### 1. 認証方式: 署名付き Cookie（itsdangerous）

**選択:** itsdangerous の `TimestampSigner` + JSON ペイロードを `HttpOnly` Cookie に格納する。

**代替案:**
- JWT（PyJWT）: 機能的にはほぼ同等だが、このアプリは SPA + 自前 API の閉じた構成であり、JWT の「第三者が検証可能」という利点が不要。itsdangerous のほうがシンプル。
- DB セッションテーブル: セッション失効の即時性が高いが、テーブル管理・クリーンアップが必要。2 時間の idle timeout と Cookie 削除で十分なため不採用。

**Cookie の構造:**
```
Name:     session
Value:    itsdangerous.sign(json.dumps({
            "user_id": 1,
            "username": "alice",
            "role": "editor",
            "issued_at": 1719100000
          }))
Flags:    HttpOnly, SameSite=Lax, Secure(本番のみ), Path=/
MaxAge:   7200 (2h)
```

**Sliding window:** 各レスポンスで Cookie を再署名・再発行する。`issued_at` を現在時刻に更新することで、アクティブな間はセッションが延長される。

### 2. パスワードハッシュ: bcrypt

**選択:** `bcrypt` ライブラリでパスワードをハッシュ化して DB に保存する。

**代替案:**
- argon2: より新しいアルゴリズムだが、`argon2-cffi` は C 拡張のビルドが必要な環境がある。bcrypt は広く安定しており、このアプリの規模では十分。

### 3. ユーザー管理: CLI（click）

**選択:** `click` を使った CLI コマンドで、ユーザーの CRUD を行う。

**代替案:**
- typer: FastAPI と同じ作者で相性が良いが、click のほうが依存が軽量で、対話入力（`click.prompt` でパスワード入力）のサポートが成熟している。

**コマンド体系:**
```
python -m app.cli user create <username> --role <viewer|editor>
python -m app.cli user list
python -m app.cli user set-role <username> <viewer|editor>
python -m app.cli user reset-password <username>
python -m app.cli user delete <username>
```

### 4. 認可: ミドルウェアレベルの HTTP メソッド判定

**選択:** 認証ミドルウェア内で、`role == "viewer"` かつ HTTP メソッドが `POST/PUT/PATCH/DELETE` の場合に 403 を返す。

**代替案:**
- FastAPI Depends でルーターごとに認可: より細かい制御が可能だが、全ルーターに Depends を追加する変更量が大きい。HTTP メソッドベースの判定でこのアプリの要件（viewer = 読み取り専用）は満たせる。

**ホワイトリスト:** viewer でも POST が必要なエンドポイント:
- `POST /api/auth/login` — ログイン自体
- `POST /api/auth/logout` — ログアウト自体
- `/api/auth/me` — セッション確認（GET）

### 5. フロントエンドのタイムアウト検知

**選択:** クライアントサイドのアクティビティタイマー + 定期的なサーバー確認の二重構造。

**仕組み:**
1. ユーザー操作（click, keydown, scroll, mousemove）を検知して `lastActivity` を更新する
2. 60 秒ごとのインターバルで `now - lastActivity > 2h` をチェックする
3. 超過していれば `GET /api/auth/me` でサーバー側を確認する
4. 401 が返ったらタイムアウトオーバーレイを表示し、ログインページへ誘導する
5. API クライアントの全リクエストで 401 をキャッチし、同様にタイムアウト処理する

**代替案:**
- サーバーポーリングのみ: シンプルだが、アイドル中もポーリングが走る。クライアントサイドのタイマーと組み合わせることで不要なリクエストを削減する。

### 6. フロントエンドの認可 UI 制御

**選択:** `AuthContext` で `role` を提供し、各コンポーネントで条件付きレンダリング。

**仕組み:**
- `AuthContext` が `/api/auth/me` のレスポンス（`username`, `role`）を保持する
- viewer の場合: 作成・編集・削除ボタンを非表示にする（disabled ではなく非表示）
- ルーティングレベルではブロックしない（URL 直打ちで到達しても、API 側で 403 が返る）

### 7. ログインページの設計

**選択:** `/login` に独立したページを配置し、未認証時はすべてのルートからリダイレクトする。

**仕組み:**
- `AuthContext` のロード中はスピナーを表示する
- 未認証なら `/login` にリダイレクトする
- ログイン成功後はリダイレクト元のパスに戻す
- サイドバーにログアウトボタンを追加する

## Risks / Trade-offs

**[署名付き Cookie はサーバーサイドで即時失効できない]**
→ ユーザー削除やロール変更の即時反映にはセッションストアが必要だが、少人数利用のため `SECRET_KEY` のローテーションで全セッション失効という運用で対応する。ユーザー削除時は次のリクエストで DB 照合して 401 を返す。

**[SECRET_KEY の管理]**
→ 環境変数 `SECRET_KEY` が必須になる。未設定の場合はアプリ起動時にエラーを出す。本番デプロイの手順書に記載する。

**[Basic Auth からの移行]**
→ 破壊的変更となる。既存の `BASIC_AUTH_*` 環境変数は無視されるようになり、初回デプロイ時に CLI でユーザーを作成する必要がある。update.sh のリリースノートに移行手順を記載する。

**[Cookie ベースのため CORS 設定に注意]**
→ 開発環境ではフロントエンド（:5173）とバックエンド（:8000）がクロスオリジンになる。`allow_credentials=True` と明示的なオリジン指定が必要（`allow_origins=["*"]` は credentials と併用不可）。

## Migration Plan

1. Alembic マイグレーションで `users` テーブルを作成する
2. `BASIC_AUTH_*` 環境変数を `SECRET_KEY` に置き換える（`.env.example` を更新）
3. CLI でユーザーを作成する: `python -m app.cli user create admin --role editor`
4. Basic Auth ミドルウェアを Session Auth ミドルウェアに置き換える
5. ロールバック: マイグレーションを revert し、Basic Auth の環境変数を復元する
