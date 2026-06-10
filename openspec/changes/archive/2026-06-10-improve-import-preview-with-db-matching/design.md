## Context

CSVインポート機能は `/import/preview`（CSVパース）と `/import/execute`（DB書き込み）の2フェーズ構成。現状の問題:

- `preview` はDBセッションを持たず、出演者マッチングも重複検出もできない
- `execute` は名前完全一致で出演者を検索するが、`performer_aliases` を参照しない
- ユーザーはインポート実行後にしか結果を知ることができない

変更の核心は「preview フェーズにDB参照を持ち込み、ユーザーが判断できる情報を提供すること」。

## Goals / Non-Goals

**Goals:**
- preview フェーズで出演者マッチング（エイリアス含む）と重複作品検出を実行する
- ユーザーが行ごとにインポート可否を選択できる UI を提供する
- execute はユーザーの決定を実行するだけで、DB判断を一切しない

**Non-Goals:**
- あいまい検索・類似名マッチング（完全一致のみ）
- 複数の既存出演者候補を提示して選ばせるUI（マッチしたら1件のみ提示）
- ZIPバックアップインポート（data-export-import spec の対象）

## Decisions

### 1. preview エンドポイントに DB Session を追加

`async def preview_import(file, db: Session = Depends(get_db))` とする。  
preview がDBを持つことで、execute との責務が明確に分離される:  
「preview = 情報提供」「execute = 実行のみ」。

### 2. 出演者照合のロジック（preview 内で完結）

```
for name in performer_names:
    # 1. performers.name で完全一致検索
    performer = db.query(Performer).filter(Performer.name == name).first()
    if not performer:
        # 2. performer_aliases.name で完全一致検索
        alias = db.query(PerformerAlias).filter(PerformerAlias.name == name).first()
        if alias:
            performer = alias.performer
    
    if performer:
        # 既存: ID・メイン名・エイリアス一覧をレスポンスに含める
        existing_aliases = [a.name for a in performer.aliases]
        yield PerformerMatch(existing_id=performer.id, existing_name=performer.name,
                             existing_aliases=existing_aliases, ...)
    else:
        # 新規作成予定
        yield PerformerMatch(existing_id=None, ...)
```

**代替案（却下）**: fuzzy matching → 誤マッチのリスクが高く、ユーザーの混乱を招く。完全一致のみにとどめる。

### 3. 重複作品の検出ロジック

出演者照合後、`performer_id` セットが確定した段階で重複検出を行う。

```
# 同タイトルの作品を取得
existing_works = db.query(Work).filter(Work.title == row.title).all()

# 解決済み出演者IDセットを計算（force_new でない出演者のみ）
import_ids = {m.existing_id for m in row.performers if m.existing_id}

for work in existing_works:
    db_ids = {wp.performer_id for wp in work.work_performers}
    if import_ids == db_ids:
        row.is_duplicate_suspect = True
        row.duplicate_hint = f"既存作品 ID:{work.id} と同一の可能性があります"
        break
```

「タイトル一致 + performer_id セット一致」が成立した場合のみ重複とみなす。タイトルのみ一致は重複候補としない。

### 4. スキーマのリデザイン

**Before (preview response):**
```python
class ImportRow(BaseModel):
    performer_names: list[str]
    performer_furiganas: list[str]
```

**After (preview response):**
```python
class PerformerMatch(BaseModel):
    name: str
    furigana: str | None
    existing_id: int | None
    existing_name: str | None
    existing_aliases: list[str]

class ImportRow(BaseModel):
    performers: list[PerformerMatch]
    is_duplicate_suspect: bool = False
    duplicate_hint: str | None = None
```

**execute リクエスト（新設 ExecuteRow）:**
```python
class PerformerExecuteInfo(BaseModel):
    name: str
    furigana: str | None
    performer_id: int | None  # None=新規作成, int=既存に紐づける

class ExecuteRow(BaseModel):
    row_number: int
    title: str
    performers: list[PerformerExecuteInfo]
    directory_path: str | None

class ImportExecuteRequest(BaseModel):
    rows: list[ExecuteRow]  # スキップしない行のみ
```

### 5. フロントエンドの状態管理

`ImportPage.tsx` でプレビュー受信後に各行の状態を管理:

```typescript
type RowState = {
  row: ImportRow;
  skipped: boolean;        // 重複疑い行はデフォルト true
  performerOverrides: Record<string, boolean>;  // name → forceNew
};
```

ユーザーの選択に基づき execute リクエストを構築:
- `skipped: true` の行は送信しない
- `forceNew: true` の出演者は `performer_id: null` で送信
- それ以外は `existing_id`（または null）をそのまま `performer_id` に使用

## Risks / Trade-offs

- **重複検出の精度**: 完全一致のみのため、タイトルの表記ゆれ（スペース・記号）は検出できない → ユーザーが目視で確認する前提。あいまい検索は将来の拡張として残す。
- **エイリアスが複数の出演者にまたがる場合**: PerformerAlias には performer_id との関係があり、1エイリアスは1出演者に属する設計。重複エイリアスはDBの整合性問題であり本機能の範囲外。
- **preview と execute の間にDBが変わる可能性**: preview 後に別ユーザーが同名出演者を作成した場合、execute 時に整合性が崩れる可能性がある → execute は performer_id が指定されていれば存在確認なしにそのまま使用する。単一ユーザー利用を前提とした設計のためリスクは低い。

## Migration Plan

APIの破壊的変更があるが、このAPIはフロントエンドのみが使用する内部APIのため、フロントエンドと同時にデプロイすることで対応。DBマイグレーション不要。

## Open Questions

（なし）
