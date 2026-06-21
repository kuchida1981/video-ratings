## Why

カバー画像の削除ボタン（☓）をクリックすると確認なしに即座に画像が削除される。誤クリックによる意図しない削除が起こりやすく、他の削除操作（作品・出演者・タグ等）にはすべて確認ダイアログがあるため、一貫性にも欠ける。

## What Changes

- 作品詳細ページのカバー画像削除ボタンに `confirm()` ダイアログを追加
- 出演者詳細ページのカバー画像削除ボタンに `confirm()` ダイアログを追加

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `cover-image-management`: カバー画像削除時に確認ダイアログを表示する要件を追加

## Impact

- `frontend/src/pages/WorkDetailPage.tsx` — 削除ボタンの onClick ハンドラ変更
- `frontend/src/pages/PerformerDetailPage.tsx` — 削除ボタンの onClick ハンドラ変更
- バックエンド・API への影響なし
