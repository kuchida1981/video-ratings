## 1. バックエンド: ソートロジック追加

- [ ] 1.1 `backend/app/routers/search.py` の `search_works` 関数に `sort_by=title` ケースを追加（`result.sort(key=lambda x: x["title"].lower(), reverse=sort_desc)`）
- [ ] 1.2 `search_works` 内で `works`（SQLAlchemy オブジェクト）から `{work_id: furigana}` マップを構築するヘルパーロジックを追加（is_main=True の performer.furigana を取得）
- [ ] 1.3 `sort_by=performer_furigana` ケースを追加（furigana ありリストをソート → furigana なしを末尾結合）

## 2. フロントエンド: ソートボタン追加

- [ ] 2.1 `frontend/src/pages/WorksPage.tsx` のソートボタン群に「タイトル順」ボタンを追加（`sort_by=title`、初回選択時は `sort_desc=false`）
- [ ] 2.2 同じくソートボタン群に「出演者順」ボタンを追加（`sort_by=performer_furigana`、初回選択時は `sort_desc=false`）
