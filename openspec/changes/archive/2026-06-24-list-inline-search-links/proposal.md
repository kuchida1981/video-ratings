## Why

出演者・作品の詳細ページには Google 検索リンクがあるが、一覧ページにはない。インライン編集モードで複数エントリのカスタムフィールドを連続編集する際、各エントリを Google 検索で調べたい場面がある。現状では毎回詳細ページを開く必要があり、編集作業の効率が悪い。編集モード時に限り一覧上に検索リンクを表示することで、通常の一覧表示はすっきりしたまま、編集作業時の調査効率を向上させる。

## What Changes

- 出演者一覧テーブル（`PerformerTable`）の出演者名セルに、`editMode=true` 時のみ Google 検索アイコンリンクを表示する
- 作品一覧テーブル（`WorkTable`）のタイトルセルに、`editMode=true` 時のみ Google 検索アイコンリンクを表示する
- 検索クエリは詳細ページの既存実装と同等のフォーマットを使用する

## Capabilities

### New Capabilities

(なし)

### Modified Capabilities

- `google-search-links`: 詳細ページのみだった Google 検索リンクを、一覧テーブルの編集モード時にも表示する要件を追加
- `inline-edit-mode`: 編集モード時にテーブルの名前/タイトルセルに検索リンクが表示される動作を追加

## Impact

- `frontend/src/components/PerformerTable.tsx`: 出演者名セルに検索アイコンリンクを追加
- `frontend/src/components/WorkTable.tsx`: タイトルセルに検索アイコンリンクを追加
- 既存の `lucide-react` の `Search` アイコンを流用（新規依存なし）
