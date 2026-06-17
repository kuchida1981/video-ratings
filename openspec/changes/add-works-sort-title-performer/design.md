## Context

作品一覧 (`GET /works/search`) のソートは現在すべて Python レイヤーで実施している。SQL の `ORDER BY` は使わず、全件フェッチ後に `result.sort()` で並べる実装になっている。これはスコア計算がアプリ側集計であることや、カスタムフィールドが JSONB であることによる。今回の追加もこの方針に揃える。

## Goals / Non-Goals

**Goals:**
- `sort_by=title`: `Work.title` の Unicode 文字列順ソート（大文字小文字無視）
- `sort_by=performer_furigana`: `WorkPerformer.is_main=True` の `Performer.furigana` 昇順/降順ソート
- ふりがな未設定・出演者なしの作品は方向によらず常に末尾

**Non-Goals:**
- DB レベルの `ORDER BY`（パフォーマンス要件なし・ページネーション未実装）
- タイトルのふりがな変換（pykakasi 等）による日本語読み順ソート
- `Work` モデルへの `title_furigana` カラム追加
- `WorkListResponse` の performers に `furigana` フィールドを追加すること

## Decisions

### ソートレイヤー: Python（変更なし）

既存のすべてのソートが Python 側で実施されているため、今回も同じレイヤーに追加する。DB レベルに移行する場合は既存ソートと合わせてまとめてリファクタリングする必要があり、このチェンジのスコープ外。

### performer_furigana ソートのデータ取得

`result` dict には `performers: [{id, name}]` しか含まれない（furigana なし）。しかし `works = q.all()` で取得した SQLAlchemy オブジェクトには `work_performers → performer.furigana` が joinedload 済みで含まれる。そのため、result 構築前に `works` から `{work_id: furigana}` のマップを作り、ソート時に参照する。

```python
furigana_map: dict[int, str | None] = {}
for w in works:
    main_wp = next((wp for wp in w.work_performers if wp.is_main), None)
    furigana_map[w.id] = main_wp.performer.furigana if main_wp else None
```

### None の末尾固定: パーティション分割方式

`reverse=True` 時に `(None is None, ...)` タプルによるソートキーは None を先頭に押し出してしまう。確実に末尾固定にするため、リストを「furigana あり」「なし」に分割し、前者だけをソートして結合する。

```python
has   = [(r, furigana_map[r["id"]]) for r in result if furigana_map[r["id"]]]
nones = [r for r in result if not furigana_map[r["id"]]]
result = [r for r, _ in sorted(has, key=lambda t: t[1], reverse=sort_desc)] + nones
```

### デフォルトソート方向

タイトル・出演者ふりがなは昇順（A→Z / あ→ん）が自然。フロントエンドの既存パターンでは `setSortDesc(false)` を渡す。スコア・登録日のデフォルト `true`（降順）とは逆になるが、意図的な差異。

## Risks / Trade-offs

- **漢字タイトルの Unicode 順**: 日本語漢字はふりがなでなく Unicode コードポイント順に並ぶ。利用者がタイトルにひらがな・カタカナを多用している場合は実用的だが、漢字タイトルが混在する場合は期待と異なる並び順になりうる。→ 今回はこれを許容。タイトルふりがな対応は別チェンジとして残す。
- **is_main が複数/0件の場合**: `is_main=True` のレコードが複数あっても `next()` が最初の1件を返すため安定動作する。0件の場合は None 扱いで末尾に固定される。
