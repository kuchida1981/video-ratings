## Context

`maker`（メーカー）と `series`（シリーズ）は初期実装（001_initial.py）から works テーブルに存在するが、現時点でDB に値は一切入っておらず、UI 上でも利用実態がない。フィールドが多層にわたってコードベースに組み込まれており、実態に即してクリーンに除去する。

## Goals / Non-Goals

**Goals:**
- `maker` / `series` をDB・API・フロントエンドから完全除去する
- コードベースをシンプルにする

**Non-Goals:**
- 後方互換性の維持（soft deprecation や API バージョニングは不要）
- `maker` / `series` の代替フィールドの追加

## Decisions

### 1. DB カラムは即時 DROP する（soft deprecation なし）

**採用**: 新規 Alembic migration で `ix_works_maker`・`ix_works_series` インデックスを DROP してから `maker`・`series` カラムを DROP する。

**理由**: DB に値が存在しないため、データロスのリスクがない。外部システムからの直接 DB アクセスもない。

**却下した代替案**: カラムを残しつつ API から除外する → コードの二重管理になるだけで意味がない。

---

### 2. 既存の 001_initial.py は変更しない

**採用**: `011_remove_maker_series.py` として新規マイグレーションを追加する。

**理由**: Alembic のマイグレーション履歴を壊さないようにするため。

---

### 3. localStorage の列設定をマイグレーションしない

**採用**: ユーザーの localStorage に `"maker"` が列設定として残っていても対処しない。

**理由**: `loadWorksTableColumns()` は未知の列キーを含む配列をそのまま使うが、`WorkTable` コンポーネントは `visibleColumns.includes("maker")` で判定するため、`"maker"` キーが残っていても表示されるだけの実害はない。デフォルト列変更（`["maker", "total_score"]` → `["total_score"]`）は初回起動時のみ適用されるため、既存ユーザーへの影響は無視できる。

---

### 4. works-data-fetching spec の更新はスキップする

**採用**: `works-data-fetching` の spec ファイルは今回変更しない。

**理由**: 当該 spec はフェッチのキャッシュ戦略を定義するもので、queryKey の構成要素（maker/series の含有）は実装詳細であり spec-level behavior の変更には該当しない。

## Risks / Trade-offs

- **localStorage 残留キー** → 実害なし（上記 Decision 3 参照）
- **デフォルト列の変更** → 既存ユーザーの列設定は localStorage に保存済みのため影響なし。新規ユーザーのデフォルト列が `total_score` のみになる（初回起動時のみ適用）

## Migration Plan

1. Alembic migration `011_remove_maker_series.py` を追加
2. バックエンドコードを更新
3. フロントエンドコードを更新
4. テストを更新
5. `docker compose exec backend alembic upgrade head` を実行してデプロイ

ロールバック戦略: migration を `downgrade` すればカラムを復元可能（データは空なので実害なし）。

## Open Questions

なし
