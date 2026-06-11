## Context

SPAであるため、ページ遷移が発生してもブラウザ全体のHTML再読み込みは発生しない。そのため、Reactコンポーネント側で明示的に `document.title` を書き換える必要がある。

## Goals / Non-Goals

**Goals:**
- 各ページ遷移時にブラウザタブ名（`document.title`）が自動で更新されること
- `"ページ名 | Video Ratings"` という統一された形式で表示されること
- 詳細ページにおいて、APIデータ（作品名、出演者名）が読み込まれたらその名前を反映したタイトルに動的に更新されること
- 読み込み中やエラー時も適切なフォールバックタイトルが表示されること

**Non-Goals:**
- URLの変化とタイトル設定を完全に自動連動させること（React Router のルーティング設定にタイトルを埋め込むアプローチは、詳細ページでの非同期データ取得結果の反映が難しいため除外）
- サードパーティ製ライブラリ（`react-helmet` や `react-helmet-async` など）の導入（依存ライブラリを増やさず、軽量なカスタムフックで対応可能）

## Decisions

### カスタムフック `useDocumentTitle` を自作する
**選択肢:** (A) 自作カスタムフック / (B) react-helmetライブラリ導入 / (C) 各ページで個別に直接 `useEffect` を書く

- (B) は依存関係とバンドルサイズを増やす。
- (C) はタイトルの命名規則（`| Video Ratings` を付与する処理など）が重複し、変更があった際のメンテナンス性が悪い。
- (A) はシンプルかつ重複を完全に排除でき、命名規則も一箇所で制御できるため、最も優れている。

```typescript
// useDocumentTitle.ts の実装イメージ
import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Video Ratings` : "Video Ratings";

    return () => {
      document.title = "Video Ratings";
    };
  }, [title]);
}
```

### 詳細ページでの動的タイトルの制御
詳細ページ（`WorkDetailPage`、`PerformerDetailPage`）では、APIからデータを取得する前（`useQuery` が loading 状態の時）と、データ取得後でタイトルを切り替える。
データがまだ存在しない（`undefined`）場合は「作品詳細」または「出演者詳細」を表示し、データが利用可能になったら作品のタイトルや出演者名に更新する。

```typescript
// WorkDetailPage.tsx での適用イメージ
const { data: work } = useQuery(...);
useDocumentTitle(work ? work.title : "作品詳細");
```

## Risks / Trade-offs

- **アンマウント時のタイトル差し戻し**:
  将来的に `useDocumentTitle` を呼び出していない新しいページが追加された際、直前のページのタイトルが残る「タイトルリーク」を防ぐため、アンマウント時にデフォルトタイトル `"Video Ratings"` へリセットするクリーンアップ関数をフック内に実装する。

## Migration Plan

既存データベースや既存設定への影響は一切ないため、移行プランは不要。
