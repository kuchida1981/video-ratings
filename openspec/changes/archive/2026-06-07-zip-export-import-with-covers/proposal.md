## Why

現在のエクスポート・インポート機能はDBデータ（JSON）のみを対象としており、カバー画像（`works/`, `performers/` 配下）は対象外のため、インポート後に画像が失われる。バックアップ・環境移行の目的を果たすには画像も含める必要がある。

## What Changes

- エクスポート出力形式をJSONから**ZIPファイル**に変更する（`data.json` + `covers/` ディレクトリを1ファイルに梱包）
- インポートの受け付け形式をJSON bodyから**ZIPファイルアップロード**（multipart）に変更する
- インポート時に `uploads/covers/` を全削除してからZIP内の `covers/` を展開する（画像も洗い替え）
- フロントエンドのエクスポート・インポートUIをZIP形式に対応させる

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
- `data-export-import`: エクスポート形式をJSON→ZIP（カバー画像を含む）に変更。インポートもZIPアップロードに変更し、画像も完全置換の対象とする。

## Impact

- `backend/app/routers/data.py`: `GET /export`・`POST /import` の両エンドポイントを変更
- `frontend/src/api/client.ts`: `exportAndDownload`・`import` 関数を変更
- `frontend/src/pages/SettingsPage.tsx`: ファイル選択・確認ダイアログのロジックを変更
- 追加依存なし（`zipfile` はPython stdlib）
