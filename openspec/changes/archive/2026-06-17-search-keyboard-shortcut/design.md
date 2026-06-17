# Design: search-keyboard-shortcut

## Approach

WorkDetailPage の既存パターン（`useEffect` + `window.addEventListener("keydown", ...)`) に合わせて実装する。

## Implementation

### WorksPage.tsx の変更

1. `useRef<HTMLInputElement>` を追加し、検索 `<Input>` の `ref` に接続
2. `useEffect` で `keydown` リスナーを登録:
   - `e.key === "/"` のとき発火
   - `activeElement` が `input`, `textarea`, `[contenteditable]` の場合は無視
   - `e.preventDefault()` で "/" が入力されるのを防止
   - `searchInputRef.current.focus()` でフォーカス移動

```
keydown "/"
  ├─ activeElement が input/textarea/contenteditable → 無視
  └─ それ以外 → preventDefault() + focus()
```

### ガード条件の詳細

- `document.activeElement?.tagName` が `INPUT` or `TEXTAREA` → スキップ
- `document.activeElement?.getAttribute("contenteditable")` が truthy → スキップ
- Dialog が開いているとき: Dialog 内の input にフォーカスがある → 上記ガードで自然にスキップされる

## Files to Change

- `frontend/src/pages/WorksPage.tsx` — `useRef` + `useEffect` 追加、`<Input ref={...}>` 変更
