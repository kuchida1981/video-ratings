## REMOVED Requirements

### Requirement: 作品一覧の表示列をユーザーが選択できる
**Reason**: 作品一覧がタイルグリッド表示に移行したため、テーブルの列選択機能は不要になった。
**Migration**: `ColumnConfigPopover` コンポーネントと `useColumnConfig` フックを削除する。

### Requirement: 出演者一覧の表示列をユーザーが選択できる
**Reason**: 出演者一覧がタイルグリッド表示に移行したため、テーブルの列選択機能は不要になった。
**Migration**: `ColumnConfigPopover` コンポーネントと `useColumnConfig` フックを削除する。

### Requirement: カスタム項目を一覧の表示列として選択できる
**Reason**: タイルグリッドにはカスタム項目列は表示しない設計のため廃止。カスタム項目は各エンティティの詳細ページで引き続き参照・編集できる。
**Migration**: 廃止。

### Requirement: タグカテゴリを一覧の表示列として選択できる
**Reason**: タイルグリッドにはタグカテゴリ列は表示しない設計のため廃止。タグは各エンティティの詳細ページで引き続き参照・編集できる。
**Migration**: 廃止。

### Requirement: 列設定をブラウザに保存する
**Reason**: 列選択機能自体が廃止されたため、その永続化も不要。
**Migration**: localStorage の `column-config-works` / `column-config-performers` キーは削除不要（自然に使われなくなる）。

### Requirement: テーブルは横スクロールなしでレイアウトを維持する
**Reason**: テーブルレイアウト自体が廃止され、タイルグリッドに置き換わったため不要。
**Migration**: 廃止。
