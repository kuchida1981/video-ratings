## ADDED Requirements

### Requirement: cover_service がカバー画像の保存・削除の共通ロジックを提供する
`app/services/cover_service.py` は、Works と Performers で共通のカバー画像アップロード・削除ロジックを提供しなければならない。

#### Scenario: save_cover が画像を保存して相対パスを返す
- **WHEN** `save_cover(file, entity_type, entity_id, old_path)` を呼び出す
- **THEN** `uploads/covers/{entity_type}/` に画像が保存され、新しい相対パスが返される

#### Scenario: save_cover が古い画像を削除する
- **WHEN** `old_path` が指定されており、かつ新しいパスと異なる場合
- **THEN** 古い画像ファイルが削除される（削除失敗は無視する）

#### Scenario: save_cover が許可外の拡張子を拒否する
- **WHEN** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` 以外の拡張子のファイルが渡される
- **THEN** HTTP 400 の HTTPException が送出される

#### Scenario: delete_cover がファイルを削除する
- **WHEN** 既存の相対パスを指定して `delete_cover(cover_path)` を呼び出す
- **THEN** 対応するファイルが削除される（ファイルが存在しない場合は無視する）

### Requirement: ルーターは cover_service を使用する
`app/routers/works.py` と `app/routers/performers.py` のカバー画像操作は `cover_service.save_cover` / `cover_service.delete_cover` を呼び出さなければならない。

#### Scenario: Works と Performers で同じ cover_service が使われる
- **WHEN** `POST /works/{id}/cover` または `POST /performers/{id}/cover` リクエストが来る
- **THEN** 両エンドポイントとも `cover_service.save_cover` を呼び出し、重複コードが存在しない
