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
- タイムアウト時間の変更
- タイムアウト検知ロジックの変更
- サーバーサイドのセッション管理の変更

## Decisions

### `isTimedOut` ステートのリセットでオーバーレイを閉じる

**選択**: `AuthContext` に `clearTimedOut` 関数を追加し、ボタンクリック時にステートをリセットする

**代替案**:
- `window.location.href = "/login"` でフルリロード → 動作するが SPA のステート管理を迂回しており不格好。不要なページリロードが発生する
- `navigate` に `replace` オプションを渡す → 同一パスへの遷移なので効果なし

**理由**: `isTimedOut=false` にすればオーバーレイが消え、すでに `/login` にいるので `RequireAuth` のリダイレクトにより自然にログインフォームが見える。SPA の状態遷移として最も自然。

## Risks / Trade-offs

特になし。影響範囲がフロントエンドの3ファイルに限定された小さな修正。
