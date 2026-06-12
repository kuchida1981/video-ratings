## Why

カスタムフィールドの数値型（number）で並べ替えを行うと、DBに文字列として保存されているため辞書順（"14" < "15" < "9"）でソートされてしまう不具合がある。フロントエンドの `e.target.value` は常に文字列型を返すため、数値型フィールドの値も文字列のままAPIに送信されJSONBに格納されるのが根本原因である。

## What Changes

- **フロントエンド**: WorkDetailPage・PerformerDetailPage の `onBlur` ハンドラで、`field_type === "number"` の場合は `e.target.value` を `Number()` に変換してから送信する
- **バックエンド**: `works.update_custom_fields` および `performers.update_custom_fields` エンドポイントで、カスタムフィールド定義の `field_type` を参照し、受け取った値を適切な型（数値→float/int）に変換してから保存する
- **DBマイグレーション**: 既存の works・performers テーブルのJSONBカラムに文字列として保存された数値型フィールドの値を、数値型に変換するAlembicマイグレーションを追加する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `list-sort-by-custom-field`: 数値型カスタムフィールドのソートが正しく数値順で動作するという要件を明確化する（現行specには「数値の大きい順でソート」とあるが、データ型保証の要件が欠如している）

## Impact

- `frontend/src/pages/WorkDetailPage.tsx`: `onBlur` ハンドラ（2箇所：作品フィールドと出演者フィールド）
- `frontend/src/pages/PerformerDetailPage.tsx`: `onBlur` ハンドラ
- `backend/app/routers/works.py`: `update_custom_fields` 関数
- `backend/app/routers/performers.py`: `update_custom_fields` 関数
- `backend/alembic/versions/`: 新規マイグレーションファイル
- 既存データへの影響: works・performers の `custom_fields` JSONBカラムの数値型フィールド値が文字列から数値に変換される
