## 1. バックエンド API ルート prefix 追加

- [x] 1.1 `backend/app/main.py` の全 `include_router` 呼び出しに `prefix="/api"` を追加する
- [x] 1.2 `backend/app/main.py` の `/health` エンドポイントを `/api/health` に変更し、basic_auth_middleware の免除パスも `/api/health` に更新する

## 2. フロントエンド proxy 設定更新

- [x] 2.1 `frontend/vite.config.ts` の `/api` proxy から `rewrite` オプションを削除する

## 3. テスト更新

- [x] 3.1 `backend/tests/test_auth.py` の API パス参照を `/api/works`、`/api/health` に更新する
- [x] 3.2 `frontend/src/api/client.test.ts` のテスト内パス検証が `/api` prefix 付きであることを確認する（既に `/api` を使用しているなら変更不要）

## 4. 動作確認

- [x] 4.1 バックエンドテスト (`pytest`) が全て通ることを確認する
- [x] 4.2 フロントエンドテスト (`npm test`) が全て通ることを確認する
