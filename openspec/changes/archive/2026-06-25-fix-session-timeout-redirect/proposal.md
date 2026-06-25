## Why

セッションタイムアウト後に表示されるオーバーレイの「ログインページへ」ボタンをクリックしても何も起きないバグがある。リロードすればログイン画面になるが、ボタンが機能しないのは UX として致命的。

## What Changes

- `SessionTimeoutOverlay` のボタンクリック時に `isTimedOut` ステートをリセットしてオーバーレイを閉じるように修正
- `AuthContext` に `clearTimedOut` 関数を追加
- フロントエンドのセッションタイムアウト時間を環境変数 `VITE_SESSION_TIMEOUT_MS` で設定可能にする（デフォルト: 7200000ms = 2時間）
- `session-auth` spec にタイムアウトオーバーレイからの復帰シナリオを追記

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `session-auth`: タイムアウトオーバーレイの「ログインページへ」ボタンクリック時の動作要件を追加

## Impact

- `frontend/src/contexts/AuthContext.tsx` — `clearTimedOut` 関数追加
- `frontend/src/components/SessionTimeoutOverlay.tsx` — ボタンクリックハンドラ修正
- `frontend/src/hooks/useSessionTimeout.ts` — タイムアウト時間を環境変数から読み取るように変更
- `frontend/src/App.tsx` — 変更なし（`RequireAuth` が自動的に `/login` へリダイレクトするため）
