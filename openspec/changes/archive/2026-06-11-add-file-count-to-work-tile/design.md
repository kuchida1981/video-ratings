## Context

作品一覧API（`GET /works`）は現在 `WorkListResponse` を返すが、`file_count` フィールドを含んでいない。また `list_works` クエリは `Work.files` を joinload していないため、ファイル数の取得にはクエリ変更が必要。

フロントエンドでは `onlyUnrated` / `onlyNoCover` をクライアントサイドフィルタとして実装済み。今回の「ファイルなし」フィルタも同じパターンで追加する。

## Goals / Non-Goals

**Goals:**
- `GET /works` レスポンスに `file_count` を追加する
- 作品タイルに `file_count > 0` の場合だけファイル数バッジを表示する
- 「ファイルなし」フィルタをクライアントサイドで実装する

**Non-Goals:**
- サーバーサイドでのファイル有無フィルタリング（APIクエリパラメータ追加）
- 個別ファイルのパス一覧の一覧ページへの表示

## Decisions

### APIレスポンスへの file_count 追加

`list_works` は既に `Work.files` リレーションを利用できる構造だが、現在は `joinedload` していない。`joinedload(Work.files)` を追加し、`len(w.files)` で件数を算出する。

**代替案**: サブクエリで COUNT を取得する方法もあるが、既存の `joinedload` パターンに合わせて統一する。データ量が大きくなった場合はサブクエリへの移行を検討。

### タイルへの表示

`file_count === 0` の場合はバッジを非表示にし、タイルの視覚的ノイズを最小化する。表示する場合はスコアの左側に配置し、lucide-react の `Files` アイコンを使用する。

### フィルタ実装方式

既存の `onlyUnrated` / `onlyNoCover` と同じクライアントサイドフィルタとして実装する。`filteredWorks` の `useMemo` に条件を追加するだけで済み、API変更を最小限に抑えられる。

## Risks / Trade-offs

- `joinedload(Work.files)` の追加によりクエリが若干重くなるが、`WorkFile` は件数が少ないケースが多く許容範囲内
- `file_count` はAPIレスポンスへの追加のみで破壊的変更なし
