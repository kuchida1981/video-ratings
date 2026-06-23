## 1. Backend: DB・モデル・依存関係

- [ ] 1.1 `pyproject.toml` に `itsdangerous`, `bcrypt`, `click` を追加し、`uv lock && uv sync` で反映する
- [ ] 1.2 `app/models/models.py` に `User` モデルを追加する（id, username, password_hash, role, created_at, updated_at）
- [ ] 1.3 Alembic マイグレーションを作成・適用して `users` テーブルを作成する（username に UNIQUE 制約）
- [ ] 1.4 `app/config.py` の `Settings` に `secret_key: str` を追加する（デフォルト値なし、未設定時にバリデーションエラーで起動失敗させる）。`basic_auth_enabled`, `basic_auth_user`, `basic_auth_password` を削除する

## 2. Backend: CLI ユーザー管理

- [ ] 2.1 `app/cli.py` を作成し、`click` で `user` グループと `create`, `list`, `set-role`, `reset-password`, `delete` サブコマンドを実装する。パスワードは `click.prompt(hide_input=True)` で受け取り、bcrypt でハッシュ化する
- [ ] 2.2 `app/__main__.py` を作成し、`python -m app.cli` でエントリポイントとして実行できるようにする

## 3. Backend: 認証 API・ミドルウェア

- [ ] 3.1 `app/auth.py` を作成し、Cookie の署名・検証ユーティリティ（`create_session_cookie`, `verify_session_cookie`）を実装する。itsdangerous の `TimestampSigner` を使い、ペイロードに `user_id`, `username`, `role`, `issued_at` を含める
- [ ] 3.2 `app/routers/auth.py` を作成し、`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` エンドポイントを実装する。login は bcrypt でパスワードを検証し、成功時に `Set-Cookie` を返す。logout は Cookie を削除する。me はセッション情報を返す
- [ ] 3.3 `app/main.py` の Basic Auth ミドルウェアをセッション認証ミドルウェアに置き換える。Cookie を検証し、2h タイムアウトをチェックし、有効なら Cookie を再署名（sliding window）する。viewer の POST/PUT/PATCH/DELETE を 403 で拒否する（`/api/auth/*` と `/api/health` は除外）。auth router を include する
- [ ] 3.4 CORS ミドルウェアに `allow_credentials=True` を追加する

## 4. Backend: テスト

- [ ] 4.1 `tests/test_auth.py` を書き換え、セッション認証のテストを実装する（ログイン成功/失敗、ログアウト、me エンドポイント、タイムアウト、ヘルスチェック除外）
- [ ] 4.2 `tests/test_authorization.py` を作成し、viewer/editor のロールベース認可テストを実装する（viewer の GET 許可、POST/PUT/PATCH/DELETE 拒否、editor の全操作許可）
- [ ] 4.3 `tests/test_cli.py` を作成し、CLI コマンドのテストを実装する（user create/list/set-role/reset-password/delete、重複ユーザー名エラー）

## 5. Frontend: 認証基盤

- [ ] 5.1 `src/contexts/AuthContext.tsx` を作成する。`/api/auth/me` を呼び出してユーザー情報（username, role）を保持する。ロード中・認証済み・未認証の状態を管理する。`useAuth()` フックをエクスポートする
- [ ] 5.2 `src/pages/LoginPage.tsx` を作成する。ユーザー名・パスワードの入力フォームとエラー表示。`POST /api/auth/login` を呼び出し、成功時にリダイレクト元のパスに遷移する
- [ ] 5.3 `src/App.tsx` を修正する。`AuthContext.Provider` でラップし、未認証時は `/login` にリダイレクトする。ログインページはサイドバーなしで表示する

## 6. Frontend: タイムアウト検知

- [ ] 6.1 `src/hooks/useSessionTimeout.ts` を作成する。ユーザー操作イベント（click, keydown, scroll, mousemove）で `lastActivity` を更新し、60 秒ごとに 2h 超過をチェックする。超過時は `GET /api/auth/me` で確認し、401 なら `onTimeout` コールバックを呼ぶ
- [ ] 6.2 `src/components/SessionTimeoutOverlay.tsx` を作成する。タイムアウト時に画面全体を覆うオーバーレイで「セッションがタイムアウトしました」メッセージとログインページへのリンクを表示する
- [ ] 6.3 `src/api/client.ts` を修正する。全 API レスポンスで 401 を検知した場合にタイムアウト/未認証状態を AuthContext に通知する仕組みを追加する

## 7. Frontend: 認可 UI 制御

- [ ] 7.1 `src/pages/WorksPage.tsx` を修正し、viewer の場合は「新規作成」ボタンを非表示にする
- [ ] 7.2 `src/pages/WorkDetailPage.tsx` を修正し、viewer の場合は編集フォーム・削除ボタン・タグ追加/削除・出演者追加/削除・ファイル追加/削除・カバー画像アップロード/削除の UI を非表示にする
- [ ] 7.3 `src/pages/PerformersPage.tsx` を修正し、viewer の場合は「新規作成」ボタンとインライン編集機能を非表示にする
- [ ] 7.4 `src/pages/PerformerDetailPage.tsx` を修正し、viewer の場合は編集 UI を非表示にする
- [ ] 7.5 `src/pages/TagsPage.tsx` を修正し、viewer の場合はタグ・カテゴリの作成・編集・削除・並べ替え UI を非表示にする
- [ ] 7.6 `src/pages/SettingsPage.tsx` を修正し、viewer の場合はカスタムフィールドの作成・編集・削除・並べ替えとインポート UI を非表示にする
- [ ] 7.7 サイドバー（`App.tsx`）にログアウトボタンとユーザー名表示を追加する

## 8. 結合・クリーンアップ

- [ ] 8.1 `backend/.env.example` を更新する（`BASIC_AUTH_*` を削除、`SECRET_KEY` を追加）
- [ ] 8.2 既存の Basic Auth 関連コード・テストが完全に除去されていることを確認する
- [ ] 8.3 全テストを実行し、パスすることを確認する（`pytest` + フロントエンドテスト）
