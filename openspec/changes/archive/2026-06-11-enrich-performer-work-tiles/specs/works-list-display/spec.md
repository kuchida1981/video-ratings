## MODIFIED Requirements

### Requirement: 作品一覧レスポンスにカスタム項目とタグを含む
作品検索APIのレスポンスには、各作品の `custom_fields`（キーバリュー）と `tags`（id・name・category_id・score）を含まなければならない。

#### Scenario: カスタム項目が設定されている作品
- **WHEN** カスタム項目が設定されている作品が返される
- **THEN** `custom_fields` フィールドにキーバリュー形式でカスタム項目の値が含まれる

#### Scenario: タグが付いている作品
- **WHEN** タグが付いている作品が返される
- **THEN** `tags` フィールドに各タグの id・name・category_id・score が含まれる

#### Scenario: カスタム項目・タグが未設定の作品
- **WHEN** カスタム項目もタグも設定されていない作品が返される
- **THEN** `custom_fields` は null、`tags` は空リストになる
