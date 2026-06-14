## Why

タグ管理画面（TagsPage）はカテゴリを縦1列のアコーディオンで並べているため、画面の横幅が活用されず余白が多い。カテゴリ数が少なく（現在4つ）、各カテゴリのタグ数も3〜10程度であるため、2列グリッドのカードレイアウトに変更することで情報密度を高め、視認性を改善できる。

## What Changes

- タグカテゴリの表示を縦1列のアコーディオンリストから **2列グリッドのカードレイアウト** に変更する
- 各カードは自然な高さ（`align-items: start`）で表示し、タグ数の差異を自然に反映させる
- カテゴリ間のDnD並び替えストラテジーを `verticalListSortingStrategy` から `rectSortingStrategy` に変更する
- タグ内のDnD（縦リスト）は変更しない
- カテゴリヘッダー・タグ編集・CRUD操作の動作はそのまま維持する

## Capabilities

### New Capabilities

- `tag-page-grid-layout`: タグ管理画面のカテゴリをグリッドカード形式で表示する

### Modified Capabilities

## Impact

- `frontend/src/pages/TagsPage.tsx`: レイアウト変更・DnDストラテジー変更
- `@dnd-kit/sortable` の `rectSortingStrategy` を追加インポート
- 新規パッケージ追加なし
