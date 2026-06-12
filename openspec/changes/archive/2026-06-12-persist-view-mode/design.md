## Context

作品一覧（WorksPage）と出演者一覧（PerformersPage）にはタイル/リスト表示を切り替えるトグルがあるが、`useState` で初期値 `"tile"` として管理されており、ページ離脱時に状態が失われる。

既存のフィルター状態は `localStorage` に保存・復元されているが、`viewMode` は意図的に含めていなかった。今回これを保存対象に追加する。

## Goals / Non-Goals

**Goals:**
- viewMode の選択（tile/table）をページ再訪時に復元する
- viewMode のキーをフィルター用キーと分離し、フィルターリセット時に影響を受けないようにする

**Non-Goals:**
- サーバー側への同期
- 複数タブ間のリアルタイム同期
- ユーザーごとの設定管理（認証不要）

## Decisions

### 1. フィルターキーとは別の localStorage キーを使う

- `video-ratings:works-view-mode`
- `video-ratings:performers-view-mode`

**理由**: viewMode はフィルター（絞り込み条件）ではなく表示設定であり、「フィルターリセット」の対象に含めるべきではない。既存の `*-filters` キーに混ぜると、リセット時に一緒に消えてしまう。

**代替案**: フィルターキーに混ぜて保存し、リセット処理で viewMode だけスキップする → 保存ロジックとリセットロジックが分散して複雑になるため不採用。

### 2. WorksPage は useEffect で自動保存、PerformersPage も同様のパターンに統一

WorksPage はすでに `useEffect` で状態変化を監視して自動保存している。PerformersPage は `saveSortState` を手動呼び出しするパターンだが、viewMode 保存のために同じ `useEffect` アプローチを追加するのが最小変更で済む。

## Risks / Trade-offs

- **既存データなし時のデフォルト値**: `localStorage` にキーが存在しない場合は `"tile"` をデフォルトとする。現状と同じ挙動なので影響なし。
- **不正な値が保存されていた場合**: `"tile"` にフォールバックする。
