## Why

現在、作品一覧や出演者一覧（テーブルビューおよびタイルビュー）において、各行やタイルをクリックすると詳細画面へ遷移しますが、これらが JavaScript のイベントハンドラ（`useNavigate`）で実装されているため、Shift+中クリックやCtrl+クリックなどのブラウザ標準のショートカットキーを用いた「新しいタブで開く」操作が機能しません。ユーザーのブラウジング体験向上のため、これらの操作でも新しいタブで開けるように改善する必要があります。

## What Changes

- 作品一覧のタイル表示（`WorkTile`）およびテーブル表示（`WorkTable`）から詳細ページへの遷移リンクを `react-router-dom` の `Link` を用いた標準的なアンカー（`<a>`）要素に変更します。
- 出演者一覧のタイル表示（`PerformerTile`）およびテーブル表示（`PerformerTable`）から詳細ページへの遷移リンクを `react-router-dom` の `Link` を用いた標準的なアンカー（`<a>`）要素に変更します。
- これにより、Shift+クリック、Ctrl+クリック、Cmd+クリック、およびマウスのホイール（中ボタン）クリックによる「新しいタブで開く」動作が標準機能として動作するようになります。

## Capabilities

### New Capabilities
- `allow-new-tab-from-lists`: 作品一覧および出演者一覧のアイテム（タイル、テーブル行のリンク要素）から、ブラウザ標準のキーボード/マウスクリックショートカット（Shift+クリック、中クリックなど）で新しいタブで開けるようにする機能。

### Modified Capabilities

## Impact

- フロントエンドのリスト表示コンポーネント:
  - `WorkTile` (`frontend/src/components/WorkTile.tsx`)
  - `WorkTable` (`frontend/src/components/WorkTable.tsx`)
  - `PerformerTile` (`frontend/src/components/PerformerTile.tsx`)
  - `PerformerTable` (`frontend/src/components/PerformerTable.tsx`)
- ページコンポーネントにおけるナビゲーションロジックの整理:
  - `WorksPage` (`frontend/src/pages/WorksPage.tsx`)
  - `PerformersPage` (`frontend/src/pages/PerformersPage.tsx`)
