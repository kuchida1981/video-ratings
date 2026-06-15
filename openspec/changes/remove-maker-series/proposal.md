## Why

作品データの `maker`（メーカー）と `series`（シリーズ）フィールドは実装当初から存在するが、現在まで一切活用されておらず、DBにも値が入っていない。未使用フィールドを保持し続けることで UI・API・スキーマの複雑性が増すため、いったん廃止してコードベースをシンプルにする。

## What Changes

- **BREAKING** 作品（Work）データモデルから `maker` と `series` を削除する
- DB の `works` テーブルから両カラムおよびインデックスを DROP する（新規 Alembic migration）
- バックエンド API のリクエスト・レスポンスから `maker` / `series` フィールドを除去する
- 検索キーワードの全文一致対象から `maker` / `series` を除外する
- `maker` / `series` 専用のフィルターパラメータを API から削除する
- フロントエンドの一覧・タイル・詳細ページから `maker` / `series` の表示・入力欄を削除する
- デフォルト表示列の設定から `"maker"` を除去する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `works-data-fetching`: 作品データモデルから maker / series フィールドを削除
- `work-management`: 作品の作成・編集フォームから maker / series 入力欄を削除
- `search`: 全文検索対象・フィルターパラメータから maker / series を除外
- `works-list-display`: テーブル列の選択肢・デフォルト列設定から maker / series を削除
- `list-column-selector`: 列選択 UI から maker / series オプションを削除
- `filter-state-persistence`: 保存するフィルター状態から maker / series を除外
- `tile-grid-view`: タイルの meta 表示（maker / series 行）を削除
- `performer-work-tiles`: 出演者詳細ページの作品タイルから maker / series 表示を削除

## Impact

- **DB**: `works.maker`・`works.series` カラムと対応インデックスが消える（データロスなし、既存値なし）
- **バックエンド API**: `WorkCreate`・`WorkUpdate`・`WorkResponse` スキーマ変更。`/search` エンドポイントのクエリパラメータ変更（破壊的変更）
- **フロントエンド**: 型定義・state・UI コンポーネントの変更
- **テスト**: backend スキーマテスト・frontend API クライアントテストの修正が必要
- **localStorage**: ユーザーの列設定に `"maker"` が残っていても UI 上は無視されるため、マイグレーション不要
