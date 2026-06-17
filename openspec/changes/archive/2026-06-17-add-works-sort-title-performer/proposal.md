## Why

作品一覧でタイトルや出演者名のアルファベット・五十音順に並び替えたいが、現状は「スコア順」「登録日順」「カスタムフィールド順」しか存在しない。特定の出演者の作品をまとめて探したり、タイトル順に眺めたりする際に不便であるため。

## What Changes

- `GET /works/search` に `sort_by=title` を追加 — `Work.title` の Unicode 昇順/降順ソートに対応
- `GET /works/search` に `sort_by=performer_furigana` を追加 — `WorkPerformer.is_main=True` の `Performer.furigana` 昇順/降順ソートに対応。ふりがなが存在しない作品（出演者なし・is_main なし・furigana 未設定）は方向によらず常に末尾
- 作品一覧画面に「タイトル順」「出演者順」ソートボタンを追加（デフォルト昇順）

## Capabilities

### New Capabilities

- `works-list-sort-title-performer`: タイトル順および出演者ふりがな順によるソートオプション

### Modified Capabilities

- `search`: `/works/search` エンドポイントが受け付ける `sort_by` の値が拡張される

## Impact

- `backend/app/routers/search.py`: 新しい `sort_by` ケースを追加
- `frontend/src/pages/WorksPage.tsx`: ソートボタン2つを追加
- DBマイグレーション不要、スキーマ変更不要
