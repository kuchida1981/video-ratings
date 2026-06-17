## 1. 設定追加

- [x] 1.1 `backend/app/config.py` の `Settings` に `debug: bool = False` を追加する

## 2. FastAPI 初期化の変更

- [x] 2.1 `backend/app/main.py` の `FastAPI()` 初期化で `settings.debug` に応じて `docs_url`, `redoc_url`, `openapi_url` を切り替える

## 3. テスト

- [x] 3.1 `DEBUG=false` のとき `/docs`, `/redoc`, `/openapi.json` が 404 を返すテストを追加する
- [x] 3.2 `DEBUG=true` のとき `/docs`, `/openapi.json` が 200 を返すテストを追加する
