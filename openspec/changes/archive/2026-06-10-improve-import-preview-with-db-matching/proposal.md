## Why

CSVインポートのプレビュー段階ではDBを参照しないため、ユーザーはインポート実行まで「出演者が既存レコードに紐づくか新規作成されるか」「同一作品がすでに存在するか」を知ることができない。この不透明さにより、意図しない重複作品の生成や出演者レコードの分裂が起きうる。

## What Changes

- `/import/preview` エンドポイントにDB Sessionを追加し、出演者マッチング情報と重複作品の疑いをレスポンスに含める
- 出演者名の照合を `performers.name` および `performer_aliases.name` の完全一致で行い、マッチした場合は既存出演者のID・メイン名・エイリアス一覧を返す
- 重複作品の検出ロジックを追加: 同タイトル＋同出演者セット（ID解決後）の既存作品を重複候補とする
- プレビュー画面に「取り込む/スキップ」チェックボックスを追加。重複疑い行はデフォルトでスキップ
- 「別人として扱う」トグルを追加: 名前がマッチした出演者でも新規作成を強制できる
- `/import/execute` のリクエスト形式を変更: スキップしない行のみ送信し、各出演者の `performer_id`（既存に紐づけるか `null` で新規作成か）をフロントエンドが明示して送信する

## Capabilities

### New Capabilities

- `csv-work-import`: CSVファイルから作品を一括登録する機能。出演者マッチング（エイリアス照合含む）、重複作品検出、ユーザーによるインポート可否の選択を含む

### Modified Capabilities

（なし）

## Impact

- **Backend**: `backend/app/schemas/imports.py`（スキーマ全面変更）、`backend/app/routers/imports.py`（preview/execute ロジック変更）
- **Frontend**: `frontend/src/pages/ImportPage.tsx`（UI全面更新）、`frontend/src/types/index.ts`（型定義更新）
- **API**: `/import/preview` レスポンス形式変更、`/import/execute` リクエスト形式変更（破壊的変更だが内部APIのため影響範囲はフロントエンドのみ）
