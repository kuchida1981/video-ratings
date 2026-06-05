## 1. データベース・バックエンドモデル

- [x] 1.1 migration 005 を作成: `custom_field_definitions` に `sort_order` カラム追加、ユニーク制約を `name` 単独から `(entity_type, name)` 複合に変更、既存データを entity_type ごとに sort_order 初期化
- [x] 1.2 `backend/app/models/models.py` の `CustomFieldDefinition` に `sort_order = Column(Integer, ...)` を追加
- [x] 1.3 `backend/app/schemas/custom_field.py` の `CustomFieldDefinitionResponse` に `sort_order: int` を追加

## 2. バックエンドAPI

- [x] 2.1 `backend/app/routers/custom_fields.py` の list エンドポイントを `order_by(CustomFieldDefinition.sort_order.asc(), CustomFieldDefinition.id.asc())` に変更
- [x] 2.2 create エンドポイントで `MAX(sort_order) + 1` を entity_type ごとに計算して設定するよう変更
- [x] 2.3 `PUT /custom-field-definitions/reorder` エンドポイントを追加（`{ids: list[int]}` を受け取り sort_order を一括更新）
- [x] 2.4 migration を適用して動作確認 (`alembic upgrade head`)

## 3. フロントエンドAPIクライアント

- [x] 3.1 `frontend/src/api/client.ts` の `customFields` に `reorder: (ids: number[]) => ...` メソッドを追加

## 4. フロントエンドUI

- [x] 4.1 `frontend/src/pages/CustomFieldsPage.tsx` に `@dnd-kit/core` と `@dnd-kit/sortable` のインポートを追加
- [x] 4.2 ドラッグ可能な行コンポーネント（`SortableRow`）を実装（`useSortable` + `GripVertical` ハンドル、TagsPage.tsx のパターンを参照）
- [x] 4.3 作品用・出演者用の各テーブルを独立した `DndContext` + `SortableContext` でラップし、`handleDragEnd` で `api.customFields.reorder()` を呼ぶ処理を実装

## 5. 動作確認

- [x] 5.1 設定UI で作品用カスタム項目をD&D並び替えして順序が保存されることを確認
- [x] 5.2 設定UI で出演者用カスタム項目をD&D並び替えして順序が保存されることを確認
- [x] 5.3 並び替え後に作品詳細画面・出演者詳細画面のカスタム項目表示順が反映されることを確認
- [x] 5.4 同じ名前を work と performer 両方に作成できることを確認（複合ユニーク制約）
- [x] 5.5 新規作成した項目が末尾に追加されることを確認
