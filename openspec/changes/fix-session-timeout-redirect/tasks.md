## 1. AuthContext に clearTimedOut を追加

- [ ] 1.1 `AuthContext` の `AuthContextType` に `clearTimedOut: () => void` を追加し、`isTimedOut` を `false` にリセットする関数を実装して Provider の value に含める（`frontend/src/contexts/AuthContext.tsx`）

## 2. SessionTimeoutOverlay のボタン修正

- [ ] 2.1 `SessionTimeoutOverlay` で `useAuth` から `clearTimedOut` を取得し、ボタンクリック時に `clearTimedOut()` を呼ぶように変更する。`navigate("/login")` は不要（`RequireAuth` が自動リダイレクトするため）（`frontend/src/components/SessionTimeoutOverlay.tsx`）

## 3. フロントエンドのタイムアウト時間を環境変数で設定可能にする

- [ ] 3.1 `useSessionTimeout.ts` のハードコード `SESSION_TIMEOUT_MS` を `import.meta.env.VITE_SESSION_TIMEOUT_MS` から読み取るように変更する。未設定時は現行のデフォルト値 7200000ms を使用する（`frontend/src/hooks/useSessionTimeout.ts`）
