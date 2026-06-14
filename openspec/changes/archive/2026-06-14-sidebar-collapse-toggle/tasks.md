## 1. 依存パッケージの追加

- [x] 1.1 `@radix-ui/react-tooltip` を `frontend/package.json` に追加し `npm install` を実行する

## 2. Tooltip コンポーネントの追加

- [x] 2.1 `frontend/src/components/ui/tooltip.tsx` を作成する（`TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` をエクスポート）

## 3. App.tsx のサイドバー実装

- [x] 3.1 `useState` で collapsed 状態を管理する（初期値は `localStorage.getItem("sidebar-collapsed") === "true"`）
- [x] 3.2 トグルハンドラを実装する（`setState` と `localStorage.setItem` を同時に更新）
- [x] 3.3 `<aside>` の className を collapsed 状態で切り替える（`w-48` ↔ `w-12`、`transition-all duration-200` 付き）
- [x] 3.4 ヘッダー部分を `<img src="/favicon.svg">` + "Video Ratings" テキストに変更し、collapsed 時はテキストを非表示にする
- [x] 3.5 トグルボタンを追加する（`PanelLeftClose` / `PanelLeftOpen` アイコン、lucide-react）
- [x] 3.6 `NavItem` コンポーネントに `collapsed` prop を追加し、collapsed 時はラベルを非表示にしてアイコンのみ表示する
- [x] 3.7 collapsed 時の `NavItem` を `Tooltip` でラップしてラベルをツールチップとして表示する
- [x] 3.8 バージョン番号の表示を collapsed 時に非表示にする
- [x] 3.9 `<TooltipProvider>` をアプリのルートレベルに追加する
