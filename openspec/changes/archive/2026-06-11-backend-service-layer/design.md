## Context

現状のルーターには3種類の責務が混在している：

1. **HTTP 層**: リクエスト受け取り、バリデーション、レスポンス返却
2. **DB クエリ層**: `_load_work` / `_load_performer`（joinedload を伴う複雑なクエリ）
3. **レスポンス組み立て層**: `_build_work_response` / `_build_performer_response`（score 計算込み）
4. **ファイル操作層**: `upload_cover` / `delete_cover`（works と performers で重複）

既に `app/services/` ディレクトリが存在し `score_calculator.py` と `smb.py` が置かれているため、新規サービスは同ディレクトリに追加する。

## Goals / Non-Goals

**Goals:**
- ルーターを HTTP の関心事（エンドポイント定義・バリデーション・レスポンス返却）のみに絞る
- DB クエリとレスポンス組み立てをサービス層に移動する
- `upload_cover` / `delete_cover` の重複コードを共通化する

**Non-Goals:**
- Repository パターンの導入（DB クエリをさらに分離する層は作らない）
- API の形・機能要件の変更
- 非同期化や N+1 クエリの最適化（スコープ外）

## Decisions

### D1: サービス層の責務範囲（Option B 採用）

3段階の選択肢（A: 現状維持、B: helpers を services/ へ移動、C: フル Repository/Service 分離）のうち Option B を採用する。

```
Option B の構造:
  app/services/work_service.py
    load_work(db, work_id) -> Work
    build_work_response(work) -> dict

  app/services/performer_service.py
    load_performer(db, performer_id) -> Performer
    build_performer_response(p) -> dict

  app/services/cover_service.py
    save_cover(file, entity_type, entity_id, old_path) -> str
    delete_cover(cover_path) -> None
```

**採用理由**: このアプリは将来的に大きく成長しない見込みのため、教科書的な Repository パターンより最小限の整理で十分。Option B で重複排除と責務分離が達成できる。

### D2: cover_service の entity_type 設計

カバー画像の保存先は `uploads/covers/works/` または `uploads/covers/performers/` とエンティティ種別によって変わる。`cover_service` は `entity_type: Literal["works", "performers"]` を引数に取る。

```python
def save_cover(
    file: UploadFile,
    entity_type: Literal["works", "performers"],
    entity_id: int,
    old_path: str | None,
) -> str:  # 新しい rel_path を返す
```

### D3: build_work_response / build_performer_response の返り値型

現状は `dict[str, Any]` を返しているが、サービス層移動後も同様に `dict` を返す（Pydantic スキーマの変更は今回スコープ外）。将来的に `WorkResponse` を直接返すよう変更する場合は別途対応する。

## Risks / Trade-offs

- **[Risk] ルーターとサービス間の循環インポート** → `score_calculator` は既に services/ にあるため問題なし。services 間の参照は `cover_service` が独立しており発生しない。
- **[Trade-off] `_build_work_response` が dict を返す設計を維持** → 型安全性は低いが、今回はスコープを絞って変更を最小化する。
