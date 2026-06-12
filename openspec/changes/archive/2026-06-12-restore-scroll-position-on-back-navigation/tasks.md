## 1. カスタムフックの作成

- [x] 1.1 `frontend/src/hooks/useScrollRestoration.ts` を新規作成する
- [x] 1.2 引数 `key: string` を受け取り、マウント時に sessionStorage からスクロール位置を読み込んで `<main>` 要素の `scrollTop` に適用する `useEffect` を実装する
- [x] 1.3 アンマウント時（クリーンアップ関数）に `<main>` 要素の `scrollTop` を sessionStorage に書き込む処理を実装する
- [x] 1.4 `document.querySelector('main')` が `null` の場合は何もしない null チェックを追加する

## 2. WorksPage への適用

- [x] 2.1 `WorksPage.tsx` で `useScrollRestoration("video-ratings:works-scroll-y")` を呼び出す

## 3. PerformersPage への適用

- [x] 3.1 `PerformersPage.tsx` で `useScrollRestoration("video-ratings:performers-scroll-y")` を呼び出す
