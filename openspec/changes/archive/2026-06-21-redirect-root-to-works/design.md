## Context

`App.tsx` のルーティングで `/` と `/works` の両方が `<WorksPage />` をレンダリングしている。サイドメニューの `NavLink` は `to="/works"` を指しており、react-router-dom の `isActive` 判定はパスの一致で行われるため、`/` にいるときハイライトされない。

## Goals / Non-Goals

**Goals:**
- `/` アクセス時にサイドメニューの「作品」が正しくハイライトされる
- URL が `/works` に統一され、ユーザーにとってナビゲーション上の位置が明確になる

**Non-Goals:**
- NavLink のカスタム `isActive` ロジック追加（リダイレクトで解決するため不要）
- バックエンド側のルーティング変更

## Decisions

**`<Navigate to="/works" replace />` によるリダイレクト**

`/` の Route で `WorksPage` を直接レンダリングする代わりに、react-router-dom の `Navigate` コンポーネントでリダイレクトする。`replace` を指定することでブラウザ履歴に `/` が残らず、戻るボタンで `/` に戻ってリダイレクトループになることを防ぐ。

代替案として NavLink の `isActive` カスタマイズも検討したが、URL が `/` と `/works` の2つ存在する状態が残る点で劣る。

## Risks / Trade-offs

- `/` を直接ブックマークしているユーザーは `/works` にリダイレクトされるが、表示内容は同じなので影響なし
