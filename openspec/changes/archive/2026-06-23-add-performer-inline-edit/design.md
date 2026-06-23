## Context

作品一覧テーブル（`WorkTable`）にはインライン編集モードが実装済み。`EditableCell` コンポーネントが `WorkTable.tsx` 内に定義されており、blur 保存・boolean 即保存・失敗時赤枠ハイライトの仕組みが動作している。出演者一覧テーブル（`PerformerTable`）は現在読み取り専用で、カスタムフィールドの更新API（`PATCH /performers/{id}/custom-fields`）は既に存在する。

関連する既存コンポーネント:
- `PerformerTable`（`frontend/src/components/PerformerTable.tsx`）: テーブル描画。props で `performers`, `visibleColumns`, `customFieldDefs` を受け取る。
- `PerformersPage`（`frontend/src/pages/PerformersPage.tsx`）: viewMode 管理、列トグル、フィルタ・ソート。
- `WorkTable`（`frontend/src/components/WorkTable.tsx`）: `EditableCell` の参照実装を含む。
- `WorksPage`（`frontend/src/pages/WorksPage.tsx`）: `editMode` 管理の参照実装を含む。

## Goals / Non-Goals

**Goals:**
- `EditableCell` を共通コンポーネントとして切り出し、WorkTable と PerformerTable の両方から利用する
- 出演者一覧テーブルでカスタムフィールドをインライン編集できるようにする
- 作品一覧と同じ操作体験（blur 保存、boolean 即保存、エラーフィードバック）を提供する

**Non-Goals:**
- 出演者名・ふりがな・作品数・平均スコア・合計スコア・タグの編集
- タイル表示での編集
- バッチ更新API の追加
- 作品一覧インライン編集の動作変更（リファクタのみ、動作は同一）

## Decisions

### 1. EditableCell の共通化方式

**決定**: `WorkTable.tsx` 内の `EditableCell`、`EditableCellProps`、`getInitialStateValue`、`formatCustomValue` を `frontend/src/components/EditableCell.tsx` に切り出す。

**理由**: `EditableCell` は entity 種別に依存しない汎用的なセル編集コンポーネント。props の `workId` を `entityId` に改名するだけで完全に汎用化できる。コピーではなく共通化することでメンテナンスの二重化を防ぐ。

### 2. PerformersPage の編集モード管理

**決定**: `WorksPage` と同じパターンを踏襲する。`PerformersPage` で `editMode: boolean` を管理し、`PerformerTable` に props として渡す。

具体的に追加する要素:
- `editMode` state（ページ遷移でリセット、localStorage 非保存）
- `isEditModeDisabled` 判定（カスタムフィールド列が1つも表示されていない場合）
- `pendingSaveRef` で保留中の保存 Promise をチェーン管理
- `handleUpdateCustomField` コールバック（`api.performers.updateCustomFields` を呼ぶ）
- 編集モード OFF 時にリスト再取得（`invalidateQueries(["performers"])`）
- `Pencil` アイコンのトグルボタン（viewMode === "table" 時のみ表示）

### 3. PerformerTable の変更

**決定**: `WorkTable` と同じ props パターンを採用する。`editMode` と `onUpdateCustomField` を optional props として追加し、カスタムフィールドセルの描画を切り替える。編集モード中のカスタムフィールドセルには `onClick={e => e.stopPropagation()}` を付与する。

### 4. 編集モード中の行クリック遷移

**決定**: 現在の `PerformerTable` は行クリック遷移を実装していない（出演者名列のリンクのみ）。そのため作品一覧のような行クリック制御は不要。出演者名列のリンクは編集モード中も維持する。

## Risks / Trade-offs

- **[リファクタによるリグレッション]** → `EditableCell` の切り出しは動作変更を含まないため、リスクは低い。切り出し後に作品一覧の編集モードが正常動作することを確認する。
- **[WorkTable の `formatCustomValue` も共有]** → `formatCustomValue` は WorkTable と PerformerTable の両方に同一実装が存在する。EditableCell と同じファイルに配置して共有する。
