## ADDED Requirements

### Requirement: performer_service が Performer のロードとレスポンス組み立てを提供する
`app/services/performer_service.py` は、DB から Performer エンティティをロードする関数とレスポンス辞書を組み立てる関数を提供しなければならない。

#### Scenario: load_performer が Performer を返す
- **WHEN** 存在する performer_id で `load_performer(db, performer_id)` を呼び出す
- **THEN** 関連エンティティ（performer_tags, aliases, work_performers）を joinedload した Performer オブジェクトを返す

#### Scenario: load_performer が存在しない ID で HTTPException を送出する
- **WHEN** 存在しない performer_id で `load_performer(db, performer_id)` を呼び出す
- **THEN** HTTP 404 の HTTPException が送出される

#### Scenario: build_performer_response が辞書を返す
- **WHEN** Performer オブジェクトを引数に `build_performer_response(p)` を呼び出す
- **THEN** `id`, `name`, `tags`, `total_score`, `work_count`, `avg_work_score`, `cover_image_url` 等を含む辞書を返す

### Requirement: ルーターは performer_service の関数を呼び出す
`app/routers/performers.py` は直接 DB クエリや joinedload を記述せず、`performer_service.load_performer` と `performer_service.build_performer_response` を呼び出さなければならない。

#### Scenario: ルーターのエンドポイントがサービス関数を使う
- **WHEN** `GET /performers/{performer_id}` リクエストが来る
- **THEN** ルーターは `performer_service.load_performer(db, performer_id)` と `performer_service.build_performer_response(p)` を呼び出してレスポンスを返す
