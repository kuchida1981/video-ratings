## Context

現在のサイドバーは `App.tsx` の `<aside class="w-48 ...">` として実装されており、常に展開状態で固定されている。ナビゲーション項目は `NavItem` コンポーネントとして分離されているが、collapsed 状態の概念を持っていない。

Tooltip コンポーネントは未実装のため、`@radix-ui/react-tooltip` を追加して shadcn スタイルの `tooltip.tsx` を新規作成する必要がある。

## Goals / Non-Goals

**Goals:**
- `App.tsx` のサイドバーに折りたたみ/展開トグルを追加する
- 状態を `localStorage` に永続化する
- 折りたたみ時にアイコンのみ表示し、ツールチップでラベルを補完する
- favicon + テキストのヘッダーに変更する
- Tooltip UI コンポーネントを追加する

**Non-Goals:**
- モバイル対応（ドロワー型サイドバーなど）
- キーボードショートカットによるトグル
- サイドバー幅のリサイズ（固定 2 段階のみ）

## Decisions

### 状態管理: useState + localStorage
`useState` の初期値を `localStorage.getItem("sidebar-collapsed") === "true"` で初期化し、変更時に `localStorage.setItem` で同期する。`useEffect` は使わず、`onClick` ハンドラ内で直接両方を更新する。

**代替案**: `useReducer` や外部ストア（Zustand など）
→ 単一の boolean 値であり、App レベルのローカル状態で十分。オーバーエンジニアリングを避ける。

### Tooltip: @radix-ui/react-tooltip + shadcn スタイル
他の UI コンポーネント（`dialog.tsx` 等）と同様に shadcn パターンで `tooltip.tsx` を作成する。

**代替案**: ネイティブ `title` 属性
→ スタイルが制御できず UX が劣る。hover delay も調整できないため不採用。

**代替案**: CSS-only Tailwind tooltip
→ アクセシビリティ（`aria-describedby` 等）を手動実装する手間がかかる。Radix が提供する a11y を活用する方が望ましい。

### トグルアイコン: PanelLeftClose / PanelLeftOpen (lucide)
このユースケース専用のアイコンが lucide に存在する。すでに lucide-react を使用しているため追加依存なし。

### ヘッダー: `<img src="/favicon.svg">`
favicon は `/public/favicon.svg` に存在し、Vite の static serving で `/favicon.svg` としてアクセス可能。`<img>` タグで直接参照する。サイズは `w-6 h-6`（24px）程度が適切。

### TooltipProvider の配置
`@radix-ui/react-tooltip` は `<TooltipProvider>` でラップする必要がある。`App.tsx` のルートレベル（`<BrowserRouter>` の外側または内側）に配置する。

## Risks / Trade-offs

- **`localStorage` の初期化タイミング**: SSR 環境では `window` が未定義だが、このプロジェクトは Vite SPA のため問題なし
- **折りたたみ時のコンテンツ幅変化**: `flex-1` により自動的に広がるが、テーブルやグリッドのレイアウトが再計算される。`transition-all` が全プロパティに適用されるためメインコンテンツ側のリフローも滑らかになる

## Migration Plan

既存のサイドバーはデフォルト展開状態のため、`localStorage` に値がないユーザーには展開状態で表示される。後方互換性の問題なし。
