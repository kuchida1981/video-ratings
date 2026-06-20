## Why

ルートパス `/` にアクセスすると `WorksPage` が表示されるが、サイドメニューの「作品」がハイライトされない。`NavLink` の `isActive` 判定が `to="/works"` と現在パス `/` の不一致により `false` になるため。ユーザーにとってナビゲーション上の現在位置が不明瞭になる。

## What Changes

- `/` の Route を `WorksPage` の直接レンダリングから `/works` へのリダイレクト (`<Navigate to="/works" replace />`) に変更
- これにより `/` アクセス時は即座に `/works` に遷移し、NavLink のハイライトが正しく動作する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `sidebar-collapse`: ルートパスアクセス時のサイドメニューハイライト動作を修正

## Impact

- `frontend/src/App.tsx`: Route 定義の1行変更、`Navigate` の import 追加
