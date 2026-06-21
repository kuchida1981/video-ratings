## Context

カバー画像の削除ボタン（☓）は `WorkDetailPage.tsx`（340行目）と `PerformerDetailPage.tsx`（203行目）にあり、どちらも `onClick={() => deleteCoverMutation.mutate()}` で確認なしに即座に削除を実行している。

一方、プロジェクト内の他の削除操作（作品削除・出演者削除・タグ削除・カスタムフィールド削除・別名削除）はすべてブラウザネイティブの `confirm()` ダイアログを使っている。

## Goals / Non-Goals

**Goals:**
- カバー画像削除時に確認ダイアログを表示し、誤削除を防止する
- プロジェクト内の既存の削除確認パターンと一貫性を保つ

**Non-Goals:**
- Radix AlertDialog 等を使ったカスタム確認 UI の導入
- 既存の `confirm()` を別の UI コンポーネントに置き換えること

## Decisions

### `confirm()` を使用する

**選択**: ブラウザネイティブの `confirm()` ダイアログ
**代替案**: Radix AlertDialog コンポーネント

**理由**: プロジェクト内の全削除操作が `confirm()` を使用しており（6箇所以上）、カバー画像削除だけ別の方式にする必要がない。将来的に全体を AlertDialog に統一する場合はまとめて対応すべき。

### インラインパターンを踏襲する

既存コードと同じ `onClick={() => { if (confirm("...")) mutation.mutate(); }}` のインラインパターンを使用する。共通コンポーネントやラッパー関数は作成しない。

## Risks / Trade-offs

- [低リスク] `confirm()` はブラウザのネイティブ UI のためアプリのデザインと統一されない → 他の全削除操作と同じなので現時点では許容
