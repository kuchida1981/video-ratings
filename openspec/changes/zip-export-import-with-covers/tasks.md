## 1. バックエンド: エクスポートエンドポイント変更

- [x] 1.1 `GET /export` をZIPレスポンスに変更する（`zipfile` + `io.BytesIO` でメモリ上構築、`application/zip` で返す）
- [x] 1.2 ZIP内に `data.json` を追加する（既存のエクスポートJSONと同一内容）
- [x] 1.3 `uploads/covers/works/` の画像ファイルを `covers/works/<filename>` としてZIPに追加する
- [x] 1.4 `uploads/covers/performers/` の画像ファイルを `covers/performers/<filename>` としてZIPに追加する
- [x] 1.5 `cover_image_path` がセットされているが実ファイルが存在しない場合はスキップする（`missing_ok`相当）

## 2. バックエンド: インポートエンドポイント変更

- [x] 2.1 `POST /import` の受け付け形式をJSON bodyから `UploadFile`（multipart）に変更する
- [x] 2.2 アップロードされたZIPから `data.json` を取り出してJSONパースする
- [x] 2.3 不正なZIPまたは `data.json` 欠如時は400エラーを返す
- [x] 2.4 DBの洗い替え処理（既存ロジック）をそのまま実行する
- [x] 2.5 `uploads/covers/` 配下を全削除する
- [x] 2.6 ZIPの `covers/` を `uploads/covers/` に展開する（サブディレクトリ構造を維持）
- [x] 2.7 DB commit とファイル展開をまとめて実行し、DB rollback 時は適切にエラーを返す

## 3. フロントエンド: APIクライアント変更

- [x] 3.1 `client.ts` の `exportAndDownload` でダウンロードファイル名を `.json` → `.zip` に変更する
- [x] 3.2 `client.ts` の `import` を FormData（`file` フィールド）のPOSTに変更する

## 4. フロントエンド: SettingsPage UI変更

- [x] 4.1 ファイル入力の `accept=".json"` を `accept=".zip"` に変更する
- [x] 4.2 `handleImportFileSelect` から `FileReader`・JSON.parse を除去し、`File` オブジェクトをそのまま保持するよう変更する
- [x] 4.3 確認ダイアログにファイル名を表示する（内容プレビューは不要）
- [x] 4.4 `executeImport` でFormDataを使ってZIPをPOSTするよう変更する
