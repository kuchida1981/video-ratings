## 1. EditableCell 共通コンポーネント切り出し

- [x] 1.1 `frontend/src/components/EditableCell.tsx` を新規作成し、`WorkTable.tsx` から `EditableCell`、`EditableCellProps`、`getInitialStateValue`、`formatCustomValue` を移動する。`workId` prop を `entityId` に改名する。
- [x] 1.2 `frontend/src/components/WorkTable.tsx` から移動したコードを削除し、`EditableCell` と `formatCustomValue` を `@/components/EditableCell` からインポートに切り替える。`workId` を `entityId` に合わせて呼び出し側も修正する。

## 2. PerformerTable にインライン編集機能を追加

- [x] 2.1 `frontend/src/components/PerformerTable.tsx` に `editMode` と `onUpdateCustomField` の optional props を追加し、`formatCustomValue` を共通コンポーネントからインポートに切り替える。
- [x] 2.2 `PerformerTable` のカスタムフィールド列セルで、`editMode` が true の場合に `EditableCell` を表示し、カスタムフィールドセルに `onClick={e => e.stopPropagation()}` を付与する。

## 3. PerformersPage に編集モード管理を追加

- [x] 3.1 `frontend/src/pages/PerformersPage.tsx` に `editMode` state、`isEditModeDisabled` 判定、`pendingSaveRef`、`handleUpdateCustomField` コールバック、編集モード OFF 時の `invalidateQueries(["performers"])` を追加する（WorksPage と同じパターン）。
- [x] 3.2 `PerformersPage` のヘッダー領域に `Pencil` アイコンの編集モードトグルボタンを追加する（viewMode === "table" 時のみ表示、isEditModeDisabled 時は disabled）。`PerformerTable` に `editMode` と `onUpdateCustomField` を渡す。
