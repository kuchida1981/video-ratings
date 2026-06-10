## Context

作品一覧（WorksPage）と出演者一覧（PerformersPage）のフィルタ・ソート条件は全て React `useState` で管理されている。詳細ページへ遷移するとコンポーネントがアンマウントされ、戻ると再マウントされるため、状態が初期値にリセットされる。

## Goals / Non-Goals

**Goals:**
- フィルタ・ソート条件をブラウザ再起動後も復元できるようにする
- 両ページに一貫したフィルタ全解除ボタンを提供する

**Non-Goals:**
- URL Search Params による状態管理（URLでの共有は対象外）
- バックエンドへの条件保存
- カスタムフックやユーティリティモジュールの新規作成

## Decisions

### localStorage をストレージとして採用
**選択肢:** localStorage / sessionStorage / React Context / URL Search Params

sessionStorage はブラウザ再起動後に消えるため要件を満たさない。React Context はページリロードで消える。URL Search Params はURLが複雑になり、ページ遷移のたびにURL管理が必要になる。

localStorage はブラウザ再起動後も残り、実装も最もシンプル。

### useState 構造を維持しlocalStorageとuseEffectで拡張する
**選択肢:** (A) 個別 useState + useEffect で保存 / (B) 状態をオブジェクト一本化 / (C) カスタムフック化

既存コードへの影響を最小化するため (A) を採用する。各 useState の初期値を localStorage の読み込み値で上書きし、状態変化時に useEffect で書き込む。セッター呼び出しの変更が不要。

```
// マウント時（初期値として渡す）
const stored = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); }
  catch { return {}; }
})();
const [keyword, setKeyword] = useState<string>(stored.keyword ?? "");

// 状態変化時に保存
useEffect(() => {
  localStorage.setItem(KEY, JSON.stringify({ keyword, maker, ... }));
}, [keyword, maker, ...]);
```

カスタムフック化は2ページ分の重複を抽象化できるが、ページ固有の型情報が多くオーバーエンジニアリングになる。

### hasFilters にソート条件を追加する
WorksPage の既存 `hasFilters` はソートを除外していた。ソート条件（sortBy/sortDesc）もデフォルト値と異なれば「変更あり」とみなしてフィルタ全解除ボタンを表示する。

```
const DEFAULT_SORT_BY = "created_at";
const DEFAULT_SORT_DESC = true;

const hasFilters =
  keyword || maker || series || selectedTagIds.length > 0 ||
  onlyUnrated || onlyNoCover || onlyNoFiles ||
  sortBy !== DEFAULT_SORT_BY || sortDesc !== DEFAULT_SORT_DESC;
```

### resetFilters で localStorage も削除する
リセット時は `localStorage.removeItem(KEY)` で保存データを削除する（空オブジェクトで上書きではなく削除）。これにより次回マウント時に確実にデフォルト値が使われる。

## Risks / Trade-offs

- **localStorage の JSON パースエラー** → try/catch で囲みエラー時はデフォルト値を使用する
- **保存スキーマの変更** → 将来フィルタ項目が増減した場合、古いキーが残る可能性がある。`?? defaultValue` のフォールバックで対応できる

## Migration Plan

既存の localStorage に `video-ratings:works-filters` / `video-ratings:performers-filters` キーが存在しない状態からの移行のため、migration は不要。
