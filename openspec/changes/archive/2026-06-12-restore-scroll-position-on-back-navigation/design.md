## Context

React Router の `BrowserRouter` を使用するこのアプリでは、`/works` → `/works/:id` のナビゲーション時に `WorksPage` がアンマウントされ、戻ると再マウントされる。フィルタや viewMode は `localStorage` で復元されているが、スクロール位置はどこにも保存されていない。

スクロールコンテナは `window` ではなく `App.tsx` の `<main className="flex-1 overflow-auto p-6">` 要素であるため、ブラウザ標準のスクロール復元や React Router の `ScrollRestoration` は機能しない。

## Goals / Non-Goals

**Goals:**
- ブラウザバックで一覧ページへ戻った際にスクロール位置を復元する
- WorksPage・PerformersPage の両方に対応する
- 既存の localStorage 保存パターンと一貫したスタイルで実装する

**Non-Goals:**
- `window` スクロールへの対応（このアプリでは不要）
- スクロール位置の永続化（タブ間・セッション間での共有は不要）
- 仮想スクロール（virtualization）の導入

## Decisions

### 1. sessionStorage を使用する（localStorage ではなく）

スクロール位置の復元はブラウザバックという文脈限定の短期的な状態であり、タブを閉じたらリセットされる方が自然。`localStorage` はフィルタ・viewMode 等の設定に使うが、スクロール位置はセッション内のみ有効で十分。

代替案: `localStorage` を使う → 永続化は不要なため過剰。

### 2. カスタムフック `useScrollRestoration(key)` として切り出す

WorksPage・PerformersPage の両方で同じロジックが必要になるため、フックとして共通化する。各ページは `useScrollRestoration("video-ratings:works-scroll-y")` のように呼び出すだけで対応できる。

代替案: 各ページに直接実装する → コード重複が生まれ、PerformersPage への適用漏れが発生しやすい。

### 3. スクロールコンテナは `document.querySelector('main')` でアクセスする

App.tsx の `<main>` 要素への ref を Context 経由で渡す方法もあるが、変更スコープが広くなる。このアプリでは `<main>` は 1 要素だけ存在するため、`querySelector` で十分に安全。

代替案: Context で ref を共有する → より綺麗だが、App.tsx の変更とContext追加が必要でスコープが過大。

### 4. 保存は `useEffect` のクリーンアップ、復元は `useEffect` のマウント時

- **保存**: コンポーネントのアンマウント時（クリーンアップ関数）に `scrollTop` を sessionStorage へ書く
- **復元**: マウント直後の `useEffect` で sessionStorage から読んで `scrollTop` を設定する

`useLayoutEffect` で復元することも検討したが、データ取得（React Query）によるリレンダリングでリストの高さが変化するため、DOM が安定してから復元する必要がある。ただし単純な `useEffect` でも実用上は問題ない（スクロール先の要素が描画済みであれば機能する）。

## Risks / Trade-offs

- **データ読み込み中にスクロール復元が走る可能性** → データが空の状態では scrollTop を設定しても意味がないが、エラーにはならない。データ表示後の再レンダリングでレイアウトが変わっても、ユーザーが既にスクロールしている状態と同様なので問題ない。
- **`document.querySelector('main')` が null になるケース** → null チェックを入れるため安全。テスト環境でのみ注意が必要。

## Migration Plan

既存動作への影響はなし。機能追加のみのため、ロールバックはフックの呼び出し 2 行を削除するだけで完了する。
