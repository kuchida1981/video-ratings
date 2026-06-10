## Why

作品一覧・出演者一覧でフィルタやソートを設定した後に詳細ページへ遷移すると、ページコンポーネントが再マウントされて条件がリセットされてしまう。詳細確認→一覧へ戻るという操作の度に条件を再入力する必要があり、使い勝手が悪い。

## What Changes

- 作品一覧（WorksPage）のフィルタ・ソート条件を localStorage に保存し、ページ再訪時・ブラウザ再起動後も復元する
- 出演者一覧（PerformersPage）のフィルタ・ソート条件を localStorage に保存し、同様に復元する
- 作品一覧に「フィルタ全解除」ボタンを改修する（ソート条件もリセット対象に含める）
- 出演者一覧に「フィルタ全解除」ボタンを新規追加する（フィルタ・ソートをまとめてリセット）

## Capabilities

### New Capabilities

- `filter-state-persistence`: フィルタ・ソート条件の localStorage への永続化と復元、全解除ボタンの提供

### Modified Capabilities

- `works-list-display`: フィルタ全解除の対象にソート条件を含めるよう要件を変更
- `performer-list-sort`: フィルタ条件の永続化・全解除UIを追加するよう要件を変更

## Impact

- `frontend/src/pages/WorksPage.tsx`: localStorage読み書き追加、hasFilters・resetFilters修正
- `frontend/src/pages/PerformersPage.tsx`: localStorage読み書き追加、hasFilters・resetFilters追加
- バックエンド変更なし、API変更なし
