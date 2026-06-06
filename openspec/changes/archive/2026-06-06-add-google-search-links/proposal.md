## Why

出演者・作品の個別ページで外部の情報を調べたいとき、毎回手動でGoogle検索する手間がかかる。名前やタイトルをコピーして検索窓に貼り付ける操作を省き、ワンクリックで検索結果を開けるようにする。

## What Changes

- 出演者詳細ページのヘッダーに Google 検索リンクアイコンを追加する
  - 検索クエリ: `"出演者名"`
- 作品詳細ページのヘッダーに Google 検索リンクアイコンを追加する
  - 検索クエリ: `"出演者名1" "出演者名2" ... "作品タイトル"`（全出演者 + 作品タイトル）
- 編集モード中はリンクを非表示にする
- リンクは新しいタブで開く

## Capabilities

### New Capabilities

- `google-search-links`: 出演者・作品の詳細ページから Google 検索を行うためのリンク機能

### Modified Capabilities

（なし）

## Impact

- `frontend/src/pages/PerformerDetailPage.tsx`: Google 検索リンクアイコンの追加
- `frontend/src/pages/WorkDetailPage.tsx`: Google 検索リンクアイコンの追加
- 外部依存の追加なし（lucide-react は既存）
