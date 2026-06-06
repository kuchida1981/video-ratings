## 1. バックエンド: スキーマ拡張

- [ ] 1.1 `backend/app/schemas/work.py` の `PerformerInWork` に `tags: list[TagInWork]` と `total_score: int` フィールドを追加する
- [ ] 1.2 `backend/app/routers/works.py` の `_build_work_response` で各出演者の performer_tags と total_score をレスポンスに含める（`_load_work` の joinedload は変更不要）

## 2. フロントエンド: 型定義の更新

- [ ] 2.1 `frontend/src/types/index.ts` の `PerformerInWork`（または Work 内のperformer型）に `tags: Tag[]` と `total_score: number` を追加する

## 3. フロントエンド: WorkDetailPage の出演者セクション改修

- [ ] 3.1 `WorkDetailPage` の `useEffect` で `api.tagCategories.list("performer")` も取得し、`performerCategories` state に保存する
- [ ] 3.2 出演者セクションを、各出演者のカード（名前・スコア・タグUI）を縦積みで表示するレイアウトに変更する
- [ ] 3.3 各出演者カードにタグカテゴリ別バッジを実装し、クリックでタグの追加・削除ができるようにする（`api.performers.addTag` / `api.performers.removeTag` を使用）
- [ ] 3.4 `is_multi_select=false` のカテゴリに対して排他選択ロジックを適用する（既存タグを外してから新しいタグを追加）
- [ ] 3.5 タグ操作後に `reload()` を呼んで表示を最新状態に更新する
