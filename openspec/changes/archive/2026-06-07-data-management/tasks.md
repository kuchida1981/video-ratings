## 1. バックエンド — エクスポートAPI

- [x] 1.1 `backend/app/routers/data.py` を新規作成し、`GET /api/export` エンドポイントを実装する（全テーブルデータ + `schema_version` + `exported_at` をJSONで返す）
- [x] 1.2 Alembicの現在のリビジョン文字列を取得するユーティリティを実装する（alembic API または環境変数）
- [x] 1.3 `backend/app/main.py` に `data` ルーターを登録する

## 2. バックエンド — インポートAPI

- [x] 2.1 `backend/app/routers/data.py` に `POST /api/import` エンドポイントを追加する
- [x] 2.2 `schema_version` 検証ロジックを実装する（不一致時は400を返す）
- [x] 2.3 完全置換ロジックを実装する（外部キー順を考慮した全テーブル削除 → 再挿入、単一トランザクション）

## 3. フロントエンド — API クライアント

- [x] 3.1 `frontend/src/api/client.ts` にエクスポートAPI呼び出し（GETしてJSONファイルとしてダウンロード）を追加する
- [x] 3.2 `frontend/src/api/client.ts` にインポートAPI呼び出し（JSONファイルをPOST）を追加する

## 4. フロントエンド — 設定画面

- [x] 4.1 `frontend/src/pages/SettingsPage.tsx` を新規作成し、「カスタム項目」セクション（現 `CustomFieldsPage` の内容）と「データ管理」セクションを縦に並べる
- [x] 4.2 データ管理セクションにエクスポートボタンを実装する（クリックでJSONダウンロード）
- [x] 4.3 データ管理セクションにインポートUIを実装する（ファイル選択 → 確認ダイアログ → 実行 → 結果表示）
- [x] 4.4 `frontend/src/App.tsx` の `/settings` ルートを `CustomFieldsPage` から `SettingsPage` に変更する

## 5. フロントエンド — 作品ページへの一括登録ボタン統合

- [x] 5.1 `frontend/src/pages/WorksPage.tsx` に「一括登録」ボタンを追加する（「新規登録」ボタンの横）
- [x] 5.2 `ImportPage` のUIロジックをDialogコンポーネントとして `WorksPage` に統合する（プレビュー・実行・結果表示を含む）
- [x] 5.3 `frontend/src/App.tsx` のサイドバーから「インポート」NavItem を削除し、`/import` ルートを削除する
