## Why

作品一覧・出演者一覧はサムネ画像付きのタイルグリッドで表示されているが、データを素早くスキャンしたい場合や多くの情報を一度に比較したい場合にテーブル形式の方が適している。カスタム項目を含む任意の列を選択できるテーブル表示モードを追加することで、ユーザーが用途に応じて最適な表示形式を選べるようにする。

## What Changes

- 作品一覧（WorksPage）にタイル/テーブル表示切り替えトグルを追加
- 出演者一覧（PerformersPage）にタイル/テーブル表示切り替えトグルを追加
- テーブル表示用の新規コンポーネント `WorkTable`・`PerformerTable` を追加
- テーブル表示時、フィルタパネル内に表示列選択UIを追加（バッジ形式）
- テーブルヘッダーのクリックでソート切り替えが可能
- 選択した表示列は localStorage に保存（表示モード自体は保存しない）
- 出演者詳細ページの出演作品一覧は対象外（タイル表示のまま）

## Capabilities

### New Capabilities
- `list-table-view`: 作品一覧・出演者一覧のテーブル表示モード。表示/非表示の切り替えトグル、WorkTable・PerformerTable コンポーネント、テーブルヘッダーによるソート切り替えを含む
- `list-column-selector`: テーブル表示時の列選択UI。フィルタパネル内にバッジ形式で表示し、選択列を localStorage に永続化する

### Modified Capabilities
- `works-list-display`: タイルグリッドが唯一の表示形式という要件を変更。テーブル表示モードとの共存を許容する
- `list-column-config`: 「列設定は廃止」という要件を変更。テーブル表示モード限定で列選択機能を再導入する

## Impact

- `frontend/src/pages/WorksPage.tsx`: 表示モード state 追加、列設定 state 追加、テーブル表示条件分岐
- `frontend/src/pages/PerformersPage.tsx`: 同上
- `frontend/src/components/WorkTable.tsx`: 新規作成
- `frontend/src/components/PerformerTable.tsx`: 新規作成
- バックエンド変更なし（既存APIのレスポンス構造で対応可能）
