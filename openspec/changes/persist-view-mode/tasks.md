## 1. WorksPage の viewMode 永続化

- [ ] 1.1 `WORKS_VIEW_MODE_KEY` 定数を定義する（`"video-ratings:works-view-mode"`）
- [ ] 1.2 `viewMode` の初期値を localStorage から読み込む（不正値は `"tile"` にフォールバック）
- [ ] 1.3 `viewMode` が変化したときに localStorage へ保存する `useEffect` を追加する

## 2. PerformersPage の viewMode 永続化

- [ ] 2.1 `PERFORMERS_VIEW_MODE_KEY` 定数を定義する（`"video-ratings:performers-view-mode"`）
- [ ] 2.2 `viewMode` の初期値を localStorage から読み込む（不正値は `"tile"` にフォールバック）
- [ ] 2.3 `viewMode` が変化したときに localStorage へ保存する `useEffect` を追加する
