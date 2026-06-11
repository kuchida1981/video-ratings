## Why

作品・出演者それぞれに対してユーザーが自由にメモを残す手段がなく、管理情報を外部ツールで補完せざるを得ない。ファーストクラスのメモ欄を追加することで、アプリ内で情報を完結させられるようにする。

## What Changes

- `works` テーブルに `memo TEXT` カラムを追加
- `performers` テーブルに `memo TEXT` カラムを追加
- 作品詳細ページ・出演者詳細ページの下部（カスタム項目の下）にメモ用 Textarea を追加
- Textarea はフォーカスが外れた時点で自動保存（ブラー時保存）
- 一覧タイルへの露出なし（アイコン含む）

## Capabilities

### New Capabilities

- `work-memo`: 作品に対するフリーテキストメモの入力・保存・表示
- `performer-memo`: 出演者に対するフリーテキストメモの入力・保存・表示

### Modified Capabilities

- `work-management`: `Work` モデル・スキーマに `memo` フィールドを追加
- `performer-management`: `Performer` モデル・スキーマに `memo` フィールドを追加

## Impact

- **DB**: Alembic マイグレーション1本（`works.memo`, `performers.memo` 追加）
- **バックエンド**: `Work` / `Performer` モデル、`WorkUpdate` / `WorkResponse` / `PerformerUpdate` / `PerformerResponse` スキーマ
- **API**: 既存の PATCH エンドポイントがスキーマ変更を自動的に拾うため、エンドポイント追加なし
- **フロントエンド**: `WorkDetailPage.tsx`, `PerformerDetailPage.tsx` の UI 変更のみ
