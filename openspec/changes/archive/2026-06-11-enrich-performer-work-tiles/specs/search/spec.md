## ADDED Requirements

### Requirement: performer_id による出演者フィルタリング
作品検索 API は `performer_id` クエリパラメータを受け付け、指定された出演者が出演している作品のみを返さなければならない。このパラメータは既存の keyword・tag・maker・series フィルタと組み合わせられる。本パラメータは旧 `GET /performers/{id}/works` エンドポイントを代替する。

#### Scenario: performer_id を指定して出演作品のみを取得できる
- **WHEN** フロントエンドが `GET /works/search?performer_id=X` を呼ぶ
- **THEN** 出演者 X が出演している作品のみが返される

#### Scenario: performer_id が存在しない場合は 404 を返す
- **WHEN** 存在しない performer_id を指定して検索する
- **THEN** システムは HTTP 404 を返す

#### Scenario: performer_id と他のフィルタを組み合わせられる
- **WHEN** performer_id に加えて keyword や tag_ids も指定して検索する
- **THEN** すべての条件を AND で満たす作品のみが返される
