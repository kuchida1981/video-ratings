# Tasks: search-keyboard-shortcut

## Task 1: WorksPage に "/" キーボードショートカットを追加

**File**: `frontend/src/pages/WorksPage.tsx`
**Difficulty**: 低

### Changes

1. import に `useRef` を追加（既存の `useState, useMemo, useEffect` の横に）
2. コンポーネント内に `const searchInputRef = useRef<HTMLInputElement>(null);` を追加
3. `useEffect` を追加:
   ```typescript
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key !== "/") return;
       const tag = document.activeElement?.tagName;
       if (tag === "INPUT" || tag === "TEXTAREA") return;
       if (document.activeElement?.getAttribute("contenteditable")) return;
       e.preventDefault();
       searchInputRef.current?.focus();
     };
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
   }, []);
   ```
4. 検索の `<Input>` に `ref={searchInputRef}` を追加

### Existing Pattern (参考)

`WorkDetailPage.tsx` line 154-165 に同じ `useEffect` + `addEventListener` パターンがある。

### Commit

`feat: add "/" keyboard shortcut to focus search on WorksPage`
