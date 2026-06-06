## Why

作品一覧・出演者一覧の表示列が固定されており、カスタム項目やタグカテゴリの内容を一覧から把握できない。登録データが増えるにつれて、一覧画面で確認したい情報がユーザーによって異なるため、表示列をユーザーが自由に選択できるようにする。

## What Changes

- 作品一覧テーブルの表示列をユーザーが選択・保存できるようにする（出演者・作品名は必須固定）
- 出演者一覧テーブルの表示列をユーザーが選択・保存できるようにする（名前は必須固定）
- カスタム項目（entity_type=work/performer）を一覧の表示列として選択できるようにする
- タグカテゴリ（entity_type=work/performer）を一覧の表示列として選択できるようにする
- 列設定はブラウザの localStorage に保存する（作品・出演者で独立したキー）
- 作品検索 API のレスポンスに `custom_fields` と `tags`（category_id 含む）を追加する
- テーブルは横スクロールなし・`table-layout: fixed` + テキスト省略で対応する

## Capabilities

### New Capabilities

- `list-column-config`: 作品一覧・出演者一覧で表示列をユーザーが選択・保存する機能

### Modified Capabilities

- `works-list-display`: 作品一覧テーブルの列が固定ではなく選択式になる。カスタム項目・タグカテゴリを列として追加できる。APIレスポンスにcustom_fieldsとtagsが追加される。

## Impact

- **バックエンド**: `WorkListResponse` スキーマに `custom_fields`・`tags` フィールドを追加。`search.py` のレスポンスビルダーを更新
- **フロントエンド**: `WorkListItem` 型の拡張。`WorksPage`・`PerformersPage` のテーブル実装を全面的に置き換え。`useColumnConfig` フック・列定義・列設定ポップオーバーを新規追加
- **API互換性**: `WorkListResponse` へのフィールド追加は後方互換（既存フィールドは変更なし）
