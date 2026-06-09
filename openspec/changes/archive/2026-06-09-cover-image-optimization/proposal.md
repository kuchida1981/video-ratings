## Why

カバー画像機能の導入後、一覧ページの表示が遅い。出演者 36 名に画像を設定した状態で合計 51MB（最大 13MB 単体）のフルサイズ画像を毎回ダウンロードしており、200〜300px 幅のタイル表示に不釣り合いなデータ転送が発生している。

## What Changes

- アップロード前にブラウザ側で画像を最大 1200px 幅にリサイズ・圧縮してから送信する（Canvas API、JPEG 85%品質）
- `<img>` タグに `loading="lazy"` を追加し、スクロールで表示されるまで画像を読み込まない
- 既存のアップロード済み画像（1200px 超のもの）を一括リサイズするマイグレーションスクリプトを追加する（Pillow、1200px 超のみ対象、in-place 上書き）

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `cover-image-management`: アップロード時にクライアント側でリサイズ・圧縮してから送信するよう要件を追加する

## Impact

- `frontend/src/components/CoverUploadZone.tsx`: Canvas API によるリサイズ処理を追加
- `frontend/src/components/WorkTile.tsx` / `PerformerTile.tsx`: `loading="lazy"` を追加
- `backend/pyproject.toml`: `Pillow` 依存を追加
- `backend/scripts/resize_covers.py`: 新規（一回限りの移行スクリプト）
- `backend/Dockerfile`: Pillow の依存パッケージ（libjpeg 等）が必要な場合は追記
