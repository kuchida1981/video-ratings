## 1. バグ修正

- [x] 1.1 `backend/app/routers/works.py` の `list_works()` 内 tags dict構築に `"score": wt.tag.score` を追加する

## 2. 動作確認

- [x] 2.1 `GET /works` のレスポンスに tags の score フィールドが含まれることを確認する
