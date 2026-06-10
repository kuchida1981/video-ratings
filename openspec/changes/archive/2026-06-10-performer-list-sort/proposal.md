## Why

出演者一覧は現在、ふりがな順の固定表示のみで、作品数や点数による並び替えができない。多くの出演者が登録されると目的の出演者を探しづらく、活動量や評価順に閲覧したいニーズに応えられていない。

## What Changes

- バックエンドの `GET /performers` レスポンスに `avg_work_score` フィールドを追加する（各出演作品の total_score の平均値）
- 出演者一覧ページにソートUIコントロール（ソートキー選択 + 昇順/降順トグル）を追加する
- ソートはフロントエンドのみで実行する（取得済みデータを再並び替え）

## Capabilities

### New Capabilities

- `performer-list-sort`: 出演者一覧のソート機能。名前順・作品数順・作品平均点数順 × 昇順/降順の切り替えが可能

### Modified Capabilities

- `performer-management`: `PerformerResponse` スキーマに `avg_work_score` フィールドを追加（APIの後方互換性あり）

## Impact

- **バックエンド**: `app/routers/performers.py`（list_performers のジョインロード拡張、`_build_performer_response` に avg_work_score 計算を追加）、`app/schemas/performer.py`（`PerformerResponse` に `avg_work_score: float` 追加）
- **フロントエンド**: `src/types/index.ts`（`Performer` 型に `avg_work_score` 追加）、`src/pages/PerformersPage.tsx`（ソート状態管理とUIコントロール追加）
- **破壊的変更なし**: 既存フィールドは変更しない
