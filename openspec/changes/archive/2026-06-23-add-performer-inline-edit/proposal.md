## Why

作品一覧テーブルにはインライン編集モードが導入済みだが、出演者一覧テーブルにはまだない。出演者のカスタムフィールドを更新するには詳細ページへ遷移する必要があり、複数の出演者を連続で編集する場合に手間がかかる。作品一覧と同等のインライン編集体験を出演者一覧にも提供する。

## What Changes

- `EditableCell` コンポーネントを `WorkTable.tsx` から `components/EditableCell.tsx` に切り出し、作品・出演者テーブル両方で共有する
- `WorkTable.tsx` を共通 `EditableCell` のインポートに切り替える（動作変更なし）
- `PerformerTable` に `editMode` / `onUpdateCustomField` props を追加し、カスタムフィールド列にインライン編集UIを表示する
- `PerformersPage` に編集モード状態管理（トグルボタン、保存ハンドラ、無効化判定、保留中セーブ管理）を追加する

## Capabilities

### New Capabilities

（なし — 既存の `inline-edit-mode` の適用範囲拡大）

### Modified Capabilities

- `inline-edit-mode`: 対象を作品一覧テーブルのみから作品・出演者一覧テーブル両方に拡大する

## Impact

- `frontend/src/components/EditableCell.tsx` — 新規（共通コンポーネント）
- `frontend/src/components/WorkTable.tsx` — EditableCell 関連コードの削除・インポート切り替え
- `frontend/src/components/PerformerTable.tsx` — editMode / onUpdateCustomField props 追加、EditableCell 導入
- `frontend/src/pages/PerformersPage.tsx` — editMode state、Pencil ボタン、保存ハンドラ追加
- バックエンド変更なし（`PATCH /performers/{id}/custom-fields` は既存）
