## Context

セッションタイムアウト時のフロー:

1. `useSessionTimeout` が 2時間無操作を検知し `onTimeout` を呼ぶ
2. `handleTimedOut()` が `setUser(null)` + `setIsTimedOut(true)` を実行
3. `RequireAuth` が `isAuthenticated=false` を検知し `<Navigate to="/login">` で遷移
4. `AppRoutes` が `isTimedOut=true` を検知し `<SessionTimeoutOverlay>` をレンダリング

結果: ユーザーはすでに `/login` にいるが、オーバーレイが画面を覆っている状態。

`SessionTimeoutOverlay` のボタンは `navigate("/login")` を呼ぶが、すでに `/login` なので React Router は何もしない。`isTimedOut` もリセットされないためオーバーレイが消えない。

## Goals / Non-Goals

**Goals:**
- タイムアウトオーバーレイの「ログインページへ」ボタンが正常に動作すること
- ボタンクリックでオーバーレイが閉じ、ログインフォームが表示されること

**Non-Goals:**
- タイムアウト検知ロジックの変更
- サーバーサイドのセッション管理の変更

## Decisions

### `isTimedOut` ステートのリセットでオーバーレイを閉じる

**選択**: `AuthContext` に `clearTimedOut` 関数を追加し、ボタンクリック時にステートをリセットする

**代替案**:
- `window.location.href = "/login"` でフルリロード → 動作するが SPA のステート管理を迂回しており不格好。不要なページリロードが発生する
- `navigate` に `replace` オプションを渡す → 同一パスへの遷移なので効果なし

**理由**: `isTimedOut=false` にすればオーバーレイが消え、すでに `/login` にいるので `RequireAuth` のリダイレクトにより自然にログインフォームが見える。SPA の状態遷移として最も自然。

### フロントエンドのタイムアウト時間を環境変数で設定可能にする

**選択**: Vite の環境変数 `VITE_SESSION_TIMEOUT_MS` で設定可能にし、デフォルトは現行の 7200000ms（2時間）を維持

**理由**: バックエンドはすでに `SESSION_TIMEOUT_SECONDS` 環境変数で設定可能。フロントエンドだけハードコードされており、動作確認時にタイムアウトを短くして検証できない。`import.meta.env.VITE_SESSION_TIMEOUT_MS` で読み取り、未設定なら 7200000 をフォールバックとする。

## Risks / Trade-offs

- フロントエンドとバックエンドのタイムアウト値が食い違う可能性があるが、フロントエンドはあくまで「プロアクティブ検知」であり、最終的にはサーバー側の Cookie 有効期限が正となるため問題ない
