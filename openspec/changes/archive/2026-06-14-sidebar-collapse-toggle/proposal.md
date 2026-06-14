## Why

サイドバーが常に展開されているため、一覧画面や詳細画面のコンテンツ領域が狭い。折りたたみトグルを追加することで、必要に応じてコンテンツ領域を広げられるようにする。

## What Changes

- サイドバー上部にトグルボタン（`PanelLeftClose` / `PanelLeftOpen` アイコン）を追加する
- サイドバーは展開時 `w-48`、折りたたみ時 `w-12` に切り替わる（`transition-all duration-200` アニメーション付き）
- 折りたたみ時はナビアイコンのみ表示し、ラベルとバージョン番号は非表示にする
- 折りたたみ時はナビアイコンにホバーするとツールチップでラベルを表示する
- ヘッダー部分のロゴを favicon 画像 + テキストに変更する（展開時: favicon + "Video Ratings"、折りたたみ時: favicon のみ）
- 折りたたみ状態を `localStorage`（キー: `sidebar-collapsed`）に永続化する
- Tooltip UI コンポーネント（`@radix-ui/react-tooltip` ベース）を新規追加する

## Capabilities

### New Capabilities

- `sidebar-collapse`: サイドバーの折りたたみ/展開トグル機能。状態の永続化、アニメーション、折りたたみ時のツールチップ表示を含む。

### Modified Capabilities

（なし）

## Impact

- `frontend/src/App.tsx`: サイドバーレイアウト全体の変更
- `frontend/src/components/ui/tooltip.tsx`: 新規追加
- `frontend/package.json`: `@radix-ui/react-tooltip` 追加
