## Why

iPad Air（13インチ、~1024px）での利用を想定し、閲覧・動画再生・絞り込みの3領域においてタッチ操作に最適化する。現状は PC 向けの小さなタップターゲットと動画再生フローがタブレットでの使用感を損ねている。

## What Changes

- **動画再生フローの刷新**: 作品詳細ページのカバー画像エリアに smb:// ファイルの再生ボタンをオーバーレイ表示し、タップ1回で即全画面再生へ移行する
- **タイルグリッドのレスポンシブデフォルト**: 画面幅に応じた初期列数を設定し、iPad portrait（~1024px）で適切なタイルサイズを確保する
- **絞り込みのタッチターゲット拡大**: 作品一覧の絞り込みタグバッジおよびフィルタ Input の高さを Apple HIG 推奨（44pt）に近づける

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `smb-video-streaming`: カバー画像エリアへの再生ボタンオーバーレイと即全画面再生という新しい再生 UX を追加する
- `tile-grid-view`: 画面幅に応じたレスポンシブなデフォルト列数を導入する

## Impact

- `frontend/src/pages/WorkDetailPage.tsx`: 動画再生 UI の変更
- `frontend/src/hooks/useTileMaxColumns.ts`: レスポンシブデフォルト列数のロジック追加
- `frontend/src/pages/WorksPage.tsx`: 絞り込みバッジ・Input のスタイル調整
- バックエンド・API への変更なし
