## Why

作品一覧・出演者一覧がテキスト主体のテーブル表示になっており、視覚的な訴求力に欠ける。カバー画像を設定してタイル形式で閲覧できるようにすることで、コンテンツの視認性と操作性を大幅に向上させる。

## What Changes

- 作品一覧・出演者一覧・出演者詳細ページの出演作品セクションをテーブルからタイルグリッド表示に変更
- 作品・出演者それぞれにカバー画像（ローカルアップロード / クリップボード貼り付け）を設定できる機能を追加
- タイルは正方形ベースのカード（上部: 16:9 横長カバー画像、下部: メタ情報）
  - 作品タイル: タイトル、出演者名、スコア
  - 出演者タイル: 名前、出演作品数、スコア
- グリッドの最大列数を設定画面（Settings）でグローバルに設定可能（デフォルト: 6、localStorage 保存）
- **BREAKING**: `ColumnConfigPopover` コンポーネントと `useColumnConfig` フックを廃止（テーブル表示がなくなるため不要）

## Capabilities

### New Capabilities

- `tile-grid-view`: 作品・出演者をタイルグリッドで表示する UI 機能。WorkTile / PerformerTile コンポーネント、最大列数設定を含む
- `cover-image-management`: 作品・出演者へのカバー画像アップロード・削除機能。ファイルアップロードとクリップボード貼り付けに対応

### Modified Capabilities

- `works-list-display`: テーブル表示からタイルグリッド表示へ変更。ColumnConfig 機能を廃止
- `performer-management`: 出演者一覧・出演者詳細の出演作品セクションをタイルグリッドに変更。カバー画像 UI を追加

## Impact

- **バックエンド**: `works` / `performers` テーブルに `cover_image_path` カラム追加（DB マイグレーション）。画像アップロードエンドポイント追加。FastAPI 静的ファイル配信設定追加
- **フロントエンド**: `WorksPage`, `PerformersPage`, `PerformerDetailPage`, `WorkDetailPage`, `SettingsPage` を更新。`ColumnConfigPopover` / `useColumnConfig` を削除
- **API**: `WorkListResponse`, `PerformerResponse` に `cover_image_url` フィールド追加
- **依存関係**: 画像処理に Python `Pillow`（オプション: リサイズ用）を追加検討
