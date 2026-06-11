## Context

出演者詳細ページ（PerformerDetailPage）の出演作品セクションは `WorkTile` コンポーネントを `WorksPage` と共用している。`WorksPage` は数百件規模の一覧を想定した compact な表示で設計されており、出演者詳細ページ（件数 5〜20 程度）では情報密度が低い。

また、`GET /performers/{id}/works` と `GET /works/search` のレスポンス構築コードがほぼ完全に重複している（`WorkListResponse` を同じ dict 構造で手組み）。さらに `TagInWorkList`（一覧用）には `score` フィールドがなく、`TagInWork`（詳細用）との不一致がある。

## Goals / Non-Goals

**Goals:**
- 出演者詳細ページの出演作品タイルに maker/series・タグ（スコア付き）を追加表示する
- `WorkListResponse` のタグレスポンスに `score` を追加し、一覧と詳細の型を揃える
- `GET /performers/{id}/works` を `GET /works/search?performer_id=X` に統合してコード重複を解消する

**Non-Goals:**
- `WorksPage` の表示変更
- 出演者タグのレスポンス変更（Performer 詳細の tags はスコア付きで既に正しい）
- 「この作品でのこの出演者の評価」（per-work performer tag）のデータモデル追加
- ページネーション・無限スクロール等の件数制御

## Decisions

### 1. performer_id フィルタを /works/search に追加してエンドポイントを統合する

`GET /performers/{id}/works` のロジックは `search_works()` の performer フィルタとして実装する。performer_id が指定された場合は Performer の存在チェックを行い（404）、`WorkPerformer.performer_id == performer_id` で絞り込む。

**却下した代替案**: 旧エンドポイントを残しつつ enrichment だけ行う → コード重複が解消されない。

### 2. TagInWorkList に score を追加する

`TagInWorkList` は `Tag` テーブルの `score` カラムを joinedload で既に取得済みのため追加クエリゼロで対応できる。`TagInWork`（WorkResponse）と同一フィールド構成にする。

**却下した代替案**: WorkListResponse と WorkResponse のタグ型を別のままにする → フロントエンドの型定義が不一致のまま残る。

### 3. WorkTile に variant props を追加する

`variant?: "compact" | "default"` を追加し、デフォルト値は `"compact"`（既存動作を壊さない）。`WorksPage` は props 変更不要。`PerformerDetailPage` のみ `variant="default"` を指定する。

**default バリアントの追加表示内容**:
- `maker` / `series`（どちらかでもあれば、`/` で結合して1行表示）
- 作品タグ（`Badge` コンポーネント、score があれば `+N` を suffix）

**却下した代替案**: 別コンポーネント（`WorkCard` 等）を新規作成 → 共通ロジックが増殖する。カバー画像・クリック動作・スコア表示はすべて同じであり、差分は表示フィールドのみ。

### 4. フロントエンドの API 呼び出し変更

`api.performers.works(id)` → `api.works.search({ performer_id: id })` に変更。`performerWorks` queryKey はそのまま使用し、queryFn だけ差し替える。

## Risks / Trade-offs

- **Breaking change**: `GET /performers/{id}/works` の削除。外部クライアントがいる場合は問題になるが、このアプリはフロントエンドのみが消費者のため影響なし。
- **file_count の確認**: 旧エンドポイントのレスポンス構築に `file_count` が含まれていない（`len(w.files)` 取得のための joinedload がない）。search エンドポイントには含まれており、統合後はそちらのロジックを使うため問題ない。
- **タグが多い場合の折り返し**: default バリアントでタグ数が多いとタイルが縦に長くなる。`flex-wrap` で折り返すが、異常に多い場合は視覚的にうるさくなる可能性がある。現実的な件数では問題ない想定。
