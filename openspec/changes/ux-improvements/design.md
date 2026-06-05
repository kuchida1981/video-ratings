## Context

個人用動画管理アプリのフロントエンド（React/Vite）とバックエンド（FastAPI/SQLAlchemy）で構成される。
現状の問題は4点：作品一覧の20件上限、出演者列の欠如、出演作数の未表示、タグカテゴリの編集不可。
バックエンドには多くのインフラがすでに揃っており、主にフロントエンドの修正と一部スキーマ拡張で対応できる。

## Goals / Non-Goals

**Goals:**
- 作品一覧を全件表示する（ページング廃止）
- 作品一覧テーブルに出演者列を追加し列順を変更する
- 出演者一覧テーブルに出演作数列を追加する
- タグカテゴリのカテゴリ名・複数選択可をUIから編集できるようにする

**Non-Goals:**
- タグカテゴリの `entity_type`（対象）変更（既存タグとの整合性が崩れるため対象外）
- 作品一覧のページング実装（データが多くても数百程度のため不要）
- 出演者一覧のソートや検索（今回スコープ外）

## Decisions

### 全件返す方針: page_size パラメータを廃止

**決定**: バックエンドの `search.py` からページングロジック（`start = (page-1)*page_size` のスライス）を削除し、全件返す。

**理由**: 個人用アプリで件数が数百程度と明確。ページング UI を追加するよりシンプルで、フロントエンド側の実装コストも下がる。将来的に件数が増えた場合は改めて対処する。

**代替案**: `page_size=9999` を送る → バックエンドの意図が不明確になる。廃止の方が明確。

---

### 作品一覧の出演者表示: performers を WorkListResponse に追加

**決定**: `WorkListResponse` スキーマに `performers: list[PerformerNameOnly]` を追加する。`PerformerNameOnly` は `{id: int, name: str}` のみ持つ軽量型。

**理由**: 作品一覧は頻繁にアクセスされるため不要なフィールドは含めない。furigana, is_main, score は不要。

**表示形式**: カンマ区切りテキスト（例: 「田中花子, 山田太郎」）。出演者0名は「—」。テーブル列としてシンプルに表示する。

---

### 出演作数: work_count を PerformerResponse に追加

**決定**: `PerformerResponse` に `work_count: int` フィールドを追加する。`list_performers` で `joinedload(Performer.work_performers)` を追加し `len(p.work_performers)` でカウントする。

**理由**: サブクエリによる集計よりも、既存の joinedload パターンに倣う方がコードの一貫性が高い。件数が少ないため N+1 の懸念もない。

---

### タグカテゴリ編集UI: インライン編集

**決定**: カテゴリ行ヘッダーに鉛筆アイコンを追加し、クリックするとカテゴリ名と複数選択可をインラインで編集できるようにする。タグのインライン編集（既存実装）と同じパターンを踏襲する。

**理由**: ダイアログよりもインライン編集の方が既存のタグ編集 UI と一貫性があり、コードパターンも既存のものを再利用できる。

**entity_type 変更の見合わせ理由**: entity_type を変更すると、既存のタグ付け（WorkTag/PerformerTag）が不正な状態になる。バックエンドの `TagCategoryUpdate` スキーマも意図的に除外している。

## Risks / Trade-offs

- **全件返しのパフォーマンス**: 件数が数百程度であれば問題ない。数千を超える場合は再検討が必要 → 個人用で現実的ではないため許容
- **performers の joinedload 追加**: 作品検索時のクエリが複雑になる。ただし既存の joinedload 構造（work_performers → performer → performer_tags → tag）はすでにある → 追加コスト小
- **work_performers の joinedload**: 出演者一覧で追加ロードが発生するが件数が少ないため問題なし
