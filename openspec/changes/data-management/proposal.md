## Why

登録データ全体のバックアップ・環境移行手段がなく、また「インポート」というサイドバーメニューが全データインポート（設定画面）と作品一括登録（CSV）の両方に使われうる曖昧な状態になるため整理が必要。

## What Changes

- 設定画面（`/settings`）をセクション型の `SettingsPage` に刷新し、「カスタム項目」と「データ管理」の2セクションを持つ
- `GET /api/export` エンドポイントを追加: 全テーブルデータ + `schema_version`（Alembicリビジョン）をJSONで返す
- `POST /api/import` エンドポイントを追加: エクスポートと同形式のJSONを受け取り、完全置換でインポートする
- `schema_version` 不一致時はインポートをエラーで拒否する
- インポート実行前に確認ダイアログを表示する（全データ置換の警告）
- 作品ページに「一括登録」ボタンを追加し、現 `ImportPage` の機能をモーダルとして統合する
- サイドバーから「インポート」メニューを削除し、`/import` ルートを廃止する

## Capabilities

### New Capabilities
- `data-export-import`: 全登録データのエクスポート・インポート（設定画面UI + API）

### Modified Capabilities
- `work-management`: 作品ページに一括登録ボタンを追加（既存のCSV一括登録機能を移設）

## Impact

- **Backend**: `backend/app/routers/` に新ルーター `data.py` を追加、`backend/app/main.py` に登録
- **Frontend**: `App.tsx`（ルート・サイドバー変更）、新規 `SettingsPage.tsx`、`WorksPage.tsx`（一括登録ボタン追加）
- **Removed**: `ImportPage` のサイドバーナビ、`/import` ルート
- **Breaking changes**: なし（既存データ・APIへの破壊的変更なし）
