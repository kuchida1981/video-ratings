## 1. cover_service の作成（重複解消）

- [x] 1.1 `app/services/cover_service.py` を新規作成し、`save_cover(file, entity_type, entity_id, old_path)` と `delete_cover(cover_path)` を実装する
- [x] 1.2 `works.py` の `upload_cover` / `delete_cover` を `cover_service` 呼び出しに置き換える
- [x] 1.3 `performers.py` の `upload_cover` / `delete_cover` を `cover_service` 呼び出しに置き換える
- [x] 1.4 両ルーターから `_ALLOWED_IMAGE_EXTS` の重複定義を削除する（cover_service 内に一元化）

## 2. work_service の作成

- [x] 2.1 `app/services/work_service.py` を新規作成し、`works.py` の `_load_work` を `load_work(db, work_id)` として移動する
- [x] 2.2 `_build_work_response` を `build_work_response(work)` として同ファイルに移動する
- [x] 2.3 `works.py` の全エンドポイントを `work_service.load_work` / `work_service.build_work_response` 呼び出しに置き換える
- [x] 2.4 `works.py` からインポート不要になった model クラスを整理する

## 3. performer_service の作成

- [x] 3.1 `app/services/performer_service.py` を新規作成し、`performers.py` の `_load_performer` を `load_performer(db, performer_id)` として移動する
- [x] 3.2 `_build_performer_response` を `build_performer_response(p)` として同ファイルに移動する
- [x] 3.3 `performers.py` の全エンドポイントを `performer_service.load_performer` / `performer_service.build_performer_response` 呼び出しに置き換える
- [x] 3.4 `performers.py` からインポート不要になった model クラスを整理する

## 4. 動作確認

- [x] 4.1 `docker compose exec backend python -m pytest` でテストが通ることを確認する
- [x] 4.2 `docker compose exec backend ruff check app/` で lint エラーがないことを確認する
