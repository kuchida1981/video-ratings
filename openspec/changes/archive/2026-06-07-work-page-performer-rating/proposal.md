## Why

作品ページにはインライン動画再生機能があるが、出演者の評価タグを付けるには出演者ページへ移動する必要があり、動画を見ながら作品と出演者を同時に評価できない。作品詳細ページで出演者のタグ評価をインラインで行えるようにすることで、視聴中の評価体験を改善する。

## What Changes

- 作品詳細ページの出演者セクションを拡張し、各出演者のタグ評価UIをインライン表示する
- 作品APIのレスポンスに各出演者のタグ情報とスコアを追加する
- タグの追加・削除は既存の出演者タグAPIエンドポイントを流用する（新規APIは追加しない）

## Capabilities

### New Capabilities

- `work-page-performer-rating`: 作品詳細ページから出演者のタグ評価をインラインで行う機能

### Modified Capabilities

- `tag-evaluation`: 作品ページからも出演者タグの評価が行えるよう、評価の操作コンテキストを拡張する

## Impact

- **バックエンド**: `PerformerInWork` スキーマに `tags` と `total_score` を追加。`_build_work_response` で performer_tags をレスポンスに含める（`_load_work` はすでに joinedload 済み）
- **フロントエンド**: `WorkDetailPage` で performer カテゴリを取得し、出演者ごとにタグ編集UIを展開表示
- **既存API**: 変更なし。出演者タグの操作は `/performers/{id}/tags` を流用
