## Why

Google 検索リンクの検索クエリが出演者名・作品タイトル固定であり、品番やレーベル名などテキスト型カスタム項目に入力した値を検索に活用できない。カスタム項目ごとに「検索に使うかどうか」を設定できるようにすることで、より精度の高い Google 検索を素早く実行できるようにする。

## What Changes

- `CustomFieldDefinition` に `is_search_keyword` フラグ（boolean、デフォルト false）を追加する
- `is_search_keyword` は `field_type === "text"` のカスタム項目のみ有効化できる（UI でトグルを無効化）
- カスタム項目設定ページ（CustomFieldsPage）に「検索に使う」列（Switch）を追加する
- 作品詳細ページ・作品一覧（インライン編集）の Google 検索クエリに、`is_search_keyword = true` の作品用カスタム項目の値をダブルクォート付きで追加する
- 出演者詳細ページ・出演者一覧（インライン編集）の Google 検索クエリに、`is_search_keyword = true` の出演者用カスタム項目の値をダブルクォート付きで追加する
- 値が空（空文字列・null・undefined）の場合はクエリに含めない

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `custom-fields`: `CustomFieldDefinition` に `is_search_keyword` フラグを追加。text 型のみ有効化可能。カスタム項目設定ページに「検索に使う」Switch 列を追加する。
- `google-search-links`: Google 検索クエリの生成ロジックを拡張し、`is_search_keyword = true` のテキスト型カスタム項目の値をクオート付きで末尾に追加する。

## Impact

- **バックエンド**: `custom_field_definitions` テーブルに `is_search_keyword` カラム追加（Alembic マイグレーション）、モデル・スキーマ更新、PATCH エンドポイント対応
- **フロントエンド**: `CustomFieldDefinition` 型更新、CustomFieldsPage に列追加、WorkDetailPage / WorkTable / PerformerDetailPage / PerformerTable の検索クエリ生成ロジック更新
- **API**: `CustomFieldDefinitionUpdate` に `is_search_keyword` 追加、`CustomFieldDefinitionResponse` に `is_search_keyword` 追加
