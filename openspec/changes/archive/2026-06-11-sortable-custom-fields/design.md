## Context

現在、`CustomFieldDefinition` は `name`, `field_type`, `entity_type`, `sort_order` を持つが、並べ替えへの使用可否を表すフラグはない。作品検索 API (`GET /works/search`) は `sort_by=created_at|total_score` のみ受け付け、Python レベルでソートしている（全件フェッチ後）。出演者一覧は全件取得後フロントエンドの `useMemo` でクライアントソートしている。

## Goals / Non-Goals

**Goals:**
- `CustomFieldDefinition` に `is_sortable` フラグを追加し、設定UIでトグル可能にする
- 作品検索 API が `sort_by=custom:<name>` を受け付け、型に応じた Python ソートを実行する
- 3 つの一覧ページで `is_sortable=true` のカスタム項目をソートボタンとして動的表示する
- 未入力値は常に末尾（nulls last）

**Non-Goals:**
- SQL レベルでのカスタム項目ソート（インデックス最適化等）
- ページネーション対応（全件取得の現状を維持）
- カスタム項目名のリネーム機能

## Decisions

### 1. ソート処理の場所：API 拡張 vs フロントエンド完結

**決定: API 拡張（`sort_by=custom:<name>` 形式）**

WorksPage・PerformerDetailPage はどちらも `sort_by`/`sort_desc` を API に渡し、返ってきた配列をそのまま表示する設計になっている。フロントエンド完結にすると「API が返す順序」と「表示順」が乖離し、queryKey の管理も複雑になる。

既に全件 Python ソートなのでバックエンド変更のコストは最小。PerformersPage は引き続きクライアントソートで十分（performers API は全件返すシンプルなエンドポイント）。

### 2. ソートキーの形式

**決定: `custom:<field_name>` 文字列プレフィックス方式**

`sort_by=custom:発売日` のようにフィールド名をプレフィックスで区別する。ID ベース（`custom_field:42`）と比較して、API レスポンス内の `custom_fields` キーと直接対応するため変換が不要。フィールド名変更はサポートしないので名前ベースで十分。

### 3. 型ごとのソートロジック（バックエンド）

```python
elif sort_by.startswith("custom:"):
    field_name = sort_by[len("custom:"):]
    def sort_key(x):
        v = (x["custom_fields"] or {}).get(field_name)
        if v is None:
            return (1, 0, "")   # nulls last
        if isinstance(v, (int, float)):
            return (0, v, "")
        if isinstance(v, bool):
            return (0, int(v), "")
        return (0, 0, str(v))
    result.sort(key=sort_key, reverse=sort_desc)
```

JSONB から取り出した値は Python ネイティブ型（bool → `bool`, number → `int`/`float`, text → `str`）になるため、型チェックで自然に分岐できる。`bool` は `int` のサブクラスなので `bool` チェックを先に行う。

### 4. デフォルトソート方向（フロントエンド）

カスタム項目ボタン初回クリック時のデフォルト方向：

| `field_type` | デフォルト |
|---|---|
| `number` | 降順 |
| `date` | 降順 |
| `text` | 昇順 |
| `boolean` | 降順（true 優先） |

### 5. PerformerDetailPage の作品ソート

現状、出演者詳細ページには作品ソートUIが存在しない（`api.works.search({ performer_id })` を固定パラメータで呼ぶのみ）。`sortBy`/`sortDesc` state を追加し、既存の `created_at`/`total_score` ソートボタンも追加する。localStorage への保存は行わない（詳細ページは頻繁に切り替えるため、ページ離脱でリセットが自然）。

## Risks / Trade-offs

- **フィールド名変更非対応**: `is_sortable=true` のフィールドを削除すると、localStorage に保存されたソート状態が `custom:<旧名>` のまま残る。→ ソートボタンが表示されないだけで壊れないよう、対応するボタンがない場合はデフォルトソートにフォールバックする。
- **型なしソート**: API はフィールドの型定義を参照せず値の Python 型で分岐する。text フィールドに数値が入ってもソート順は文字列として扱われる。→ 許容範囲内（ユーザーが入力した型に基づいている）。

## Migration Plan

1. Alembic マイグレーションを追加（`ALTER TABLE custom_field_definitions ADD COLUMN is_sortable BOOLEAN NOT NULL DEFAULT FALSE`）
2. バックエンド変更をデプロイ（既存 API との後方互換性あり）
3. フロントエンド変更をデプロイ

ロールバック: マイグレーションは `is_sortable` カラムを削除するだけ。フロントのソート状態は localStorage に `custom:*` 形式で保存されるが、旧フロントは `"created_at"` か `"total_score"` 以外を無視するので影響なし。
