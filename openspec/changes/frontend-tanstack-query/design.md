## Context

フロントエンドの各ページコンポーネントでは、データフェッチを `useEffect + useState + 手動 fetch` で実装している。パターンは統一されているが、次の点で冗長性・脆弱性がある。

- `useCallback` で依存配列を管理してから `useEffect` でトリガーする二段構え
- ミューテーション（追加・更新・削除）後に手動で再フェッチ関数を呼ぶ必要がある
- ローディング・エラー状態を各コンポーネントが個別に持つ
- `WorksPage.tsx` はインポートフローの状態管理も同一コンポーネントに抱えており 540 行

## Goals / Non-Goals

**Goals:**
- `@tanstack/react-query` を導入し、全フェッチを `useQuery` / `useMutation` に置き換える
- ミューテーション後の再フェッチを `queryClient.invalidateQueries` で自動化する
- `WorksPage` のインポートフロー状態を `useImportFlow` カスタムフックに切り出す

**Non-Goals:**
- API のエンドポイント・レスポンス形式を変更しない
- ページネーションを追加しない（全件取得は意図的な設計）
- フィルター状態のカスタムフック化は今回含めない

## Decisions

### D1: queryKey の設計

フィルター条件を queryKey に含めることで、条件が変わると自動的に再フェッチされる。

```ts
// works 一覧: フィルター条件を key に含める
queryKey: ['works', { keyword, maker, series, selectedTagIds, sortBy, sortDesc }]

// work 詳細: ID のみ
queryKey: ['works', workId]

// performers 一覧
queryKey: ['performers']

// performer 詳細
queryKey: ['performers', performerId]
```

**採用理由**: 依存配列の管理を React Query に委ねることで、`useCallback + useEffect` の二段構えが不要になる。

**代替案**: `staleTime` を設定してキャッシュを活用する案もあるが、このアプリはローカル用途でデータ鮮度より確実性を優先するため `staleTime: 0`（デフォルト）のままとする。

### D2: ミューテーション後のキャッシュ無効化戦略

`onSuccess` コールバックで `queryClient.invalidateQueries` を呼ぶ。楽観的更新は採用しない。

```ts
const mutation = useMutation({
  mutationFn: (data) => api.works.create(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['works'] }),
})
```

**採用理由**: 楽観的更新はロールバック処理が複雑になる。このアプリは同時編集がないため、サーバーラウンドトリップのコストより正確性を優先する。

### D3: useImportFlow フックの責務

`WorksPage` のインポートフロー固有の状態（7つの useState）とそのハンドラーをカプセル化する。フックから返す値は状態と操作のみ。

```ts
// hooks/useImportFlow.ts
export function useImportFlow() {
  // importPhase, confirmRowNumbers, importPreview,
  // importRowStates, importResult, importLoading, importDragOver
  return { state, handlers }
}
```

**採用理由**: WorksPage の関心事はフィルタリングと一覧表示。インポートUI は独立した操作フローなので分離する価値がある。フィルター状態は localStorage と密結合しているため今回はスコープ外とする。

### D4: QueryClientProvider の配置

`frontend/src/main.tsx` に配置する。App.tsx はルーティング定義が主な責務のため、最上位の main.tsx に置く方が依存関係が明確。

## Risks / Trade-offs

- **[Risk] react-query の devtools** → 今回は導入しない（開発用ツールでスコープ外）。必要になれば後から追加可能。
- **[Risk] WorkDetailPage の useEffect 数が多い（6つ）** → 1つの `useQuery` と複数の `useMutation` に整理できるが、副作用（customFieldValues の初期化等）は useEffect を残す必要がある。慎重に移行する。
- **[Trade-off] staleTime=0（デフォルト）のままにする** → ウィンドウフォーカス時に自動再フェッチが走る。ローカルアプリではほぼ無害だが、不要なら `refetchOnWindowFocus: false` を QueryClient のデフォルトに設定する。

## Open Questions

- WorkDetailPage の「performers一覧」と「work詳細」は同一コンポーネント内で両方フェッチしている。両者のキャッシュは独立で問題ないか → 独立で問題なし（work 更新後に both invalidate すればよい）。
