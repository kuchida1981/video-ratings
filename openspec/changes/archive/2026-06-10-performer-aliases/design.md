## Context

現在の `Performer` モデルは `name`（必須）と `furigana`（任意）のみを持ち、別名の概念が存在しない。出演者の改名や芸名の変化を記録するため、別名を複数管理できる仕組みを追加する。

既存のコードベースには次のパターンがある：
- タグの多対多管理（`performer_tags`）は sub-resource エンドポイント（`/performers/{id}/tags/{tag_id}`）で実装されている
- `custom_fields` は JSONB カラムで任意のキーバリューを保持している

## Goals / Non-Goals

**Goals:**
- 出演者に複数の別名（name + furigana）を CRUD できる
- 出演者取得 API レスポンスに `aliases` を含める
- フロントエンドの出演者詳細ページで別名を管理できる

**Non-Goals:**
- 別名による検索
- CSV インポートでの別名取り込み
- 別名ごとのカバー画像、タグ等の付加情報

## Decisions

### 1. 別名を専用テーブル（`performer_aliases`）で管理する

**選択**: 正規化された別テーブル  
**却下**: `performers.aliases` を JSONB 配列で保持する

**理由**: JSONB でも実装は可能だが、専用テーブルの方が行レベルの CRUD（個別の別名を PUT/DELETE）が整合的に扱える。また将来的に別名に追加フィールドが増えた際の拡張が容易。今回は検索不要とはいえ、インデックスを付ける際も正規化済みテーブルの方が自然。

### 2. API は sub-resource パターン（タグ管理と同一構造）

**選択**: `POST/PUT/DELETE /performers/{id}/aliases` および `GET /performers/{id}` に `aliases` を含める  
**却下**: performer の PUT 時に aliases を一括置換する

**理由**: 既存のタグ管理 API と対称的な設計にすることでコードの一貫性が保てる。一括置換も可能だが、個別操作の方が楽観的ロックや部分更新に対して安全。

### 3. alias に furigana を持たせる

別名が日本語名（旧芸名など）の場合は読み仮名が必要になるケースが多い。フィールドとして保持するが任意（nullable）とする。

## Risks / Trade-offs

- [リスク] `performer_aliases` の migration が適用されていない状態でフロントが `aliases` フィールドを期待する → フロントは `aliases ?? []` でデフォルト空配列を扱うことで後方互換を維持

## Migration Plan

1. Alembic migration `007_performer_aliases.py` を追加して `performer_aliases` テーブルを作成
2. `docker compose exec backend alembic upgrade head` で適用
3. ロールバック: `alembic downgrade -1`（テーブル DROP のみ、データ損失なし）

## Open Questions

- 別名に表示順序（`sort_order`）は必要か？ → 今回は不要とし、作成順（`id` 順）で返す
