## 1. バックエンド: avg_work_score の計算と返却

- [x] 1.1 `app/schemas/performer.py` の `PerformerResponse` に `avg_work_score: float` フィールドを追加する
- [x] 1.2 `list_performers` の SQLAlchemy クエリに `work_performers → work → work_tags → tag` のジョインロードを追加する
- [x] 1.3 `list_performers` の SQLAlchemy クエリに `work_performers → work → work_performers → performer → performer_tags → tag` のジョインロードを追加する
- [x] 1.4 `_build_performer_response` に `avg_work_score` の計算ロジックを追加する（作品数0のとき 0.0）

## 2. フロントエンド: 型定義の更新

- [x] 2.1 `src/types/index.ts` の `Performer` 型に `avg_work_score: number` を追加する

## 3. フロントエンド: ソートUIの実装

- [x] 3.1 `PerformersPage.tsx` にソートキー（`name` / `work_count` / `avg_work_score`）と方向（`asc` / `desc`）の state を追加する（デフォルト: name / asc）
- [x] 3.2 `PerformersPage.tsx` にソート済みパフォーマーリストを返す `useMemo` を追加する（名前ソートはふりがな優先・name フォールバック）
- [x] 3.3 ページヘッダー行にソートキー選択セレクトと昇順/降順トグルボタンを追加する
- [x] 3.4 タイルグリッドをソート済みリストで描画するよう変更する
