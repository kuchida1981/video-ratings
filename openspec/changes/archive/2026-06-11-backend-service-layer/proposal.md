## Why

`works.py` と `performers.py` のルーターに DB クエリ・レスポンス組み立て・ファイル操作が混在しており、カバー画像アップロードロジックが両ファイルにほぼ完全コピーされている。ルーターを HTTP の関心事のみに整理し、重複を除去する。

## What Changes

- `app/services/work_service.py` を新規作成し、`_load_work` / `_build_work_response` をルーターから移動する
- `app/services/performer_service.py` を新規作成し、`_load_performer` / `_build_performer_response` をルーターから移動する
- カバー画像アップロード・削除ロジック（works と performers で重複）を共通関数として `app/services/cover_service.py` に切り出す
- ルーターは HTTP エンドポイント定義・バリデーション・レスポンス返却のみを担当する

## Capabilities

### New Capabilities

- `work-service`: Work のロード・レスポンス組み立て・CRUD 操作のサービス層
- `performer-service`: Performer のロード・レスポンス組み立て・CRUD 操作のサービス層
- `cover-service`: エンティティ種別に依らないカバー画像アップロード・削除の共通ロジック

### Modified Capabilities

<!-- API の形・機能要件は変わらないためなし -->

## Impact

- `backend/app/routers/works.py`: `_load_work`, `_build_work_response`, `upload_cover`, `delete_cover` をサービス層呼び出しに置き換え
- `backend/app/routers/performers.py`: 同上（performer 側）
- `backend/app/services/work_service.py`: 新規作成
- `backend/app/services/performer_service.py`: 新規作成
- `backend/app/services/cover_service.py`: 新規作成
- 外部 API の形（エンドポイント・レスポンス形式）は変更しない
- 依存ライブラリの追加なし
