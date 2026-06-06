## 1. バックエンド: PerformerInWork スキーマに custom_fields を追加

- [x] 1.1 `backend/app/schemas/work.py` の `PerformerInWork` に `custom_fields: Optional[dict[str, Any]] = None` フィールドを追加する
- [x] 1.2 `backend/app/routers/works.py` の `_build_work_response` で performer dict に `"custom_fields": wp.performer.custom_fields` を追加する

## 2. フロントエンド: 型定義の更新

- [x] 2.1 `frontend/src/types/index.ts` の `PerformerInWork` インターフェースに `custom_fields: Record<string, unknown> | null` を追加する

## 3. フロントエンド: WorkDetailPage の state 追加

- [x] 3.1 performer 用カスタム項目定義の state `performerCFDefs` を追加し、マウント時に `api.customFields.list("performer")` で取得する
- [x] 3.2 出演者ごとの値を管理する state `performerCFValues: Record<number, Record<string, string | boolean>>` を追加する
- [x] 3.3 `work` と `performerCFDefs` が揃ったときに `performerCFValues` を初期化する `useEffect` を追加する（各出演者の `custom_fields` から値を読み込む）

## 4. フロントエンド: WorkDetailPage に更新関数と UI を追加

- [x] 4.1 `updatePerformerCustomField(performerId, name, value)` 関数を追加する（`api.performers.updateCustomFields` を呼び出し、`reload()` する）
- [x] 4.2 出演者カードの最下部（タグ評価の後）に performer カスタム項目の編集 UI を追加する（`performerCFDefs.length > 0` のときのみ描画、`PerformerDetailPage` と同じ入力パターンを使用）
