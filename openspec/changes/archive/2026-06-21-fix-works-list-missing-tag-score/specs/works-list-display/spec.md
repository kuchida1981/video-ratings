## MODIFIED Requirements

### Requirement: 作品一覧レスポンスにカスタム項目とタグを含む
作品検索APIのレスポンスには、各作品の `custom_fields`（キーバリュー）と `tags`（id・name・category_id・score）を含まなければならない（SHALL）。

#### Scenario: タグが付いている作品
- **WHEN** タグが付いている作品が返される
- **THEN** `tags` フィールドに各タグの id・name・category_id・score が含まれる
