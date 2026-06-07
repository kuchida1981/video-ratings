## 1. バックエンド: DB マイグレーション

- [x] 1.1 `works` テーブルに `cover_image_path` (nullable String) カラムを追加する Alembic マイグレーションを作成する
- [x] 1.2 `performers` テーブルに `cover_image_path` (nullable String) カラムを追加する（同マイグレーションに含める）
- [x] 1.3 `docker compose exec backend alembic upgrade head` でマイグレーションを適用する

## 2. バックエンド: モデル・スキーマ更新

- [x] 2.1 `Work` モデルに `cover_image_path = Column(String, nullable=True)` を追加する
- [x] 2.2 `Performer` モデルに `cover_image_path = Column(String, nullable=True)` を追加する
- [x] 2.3 `WorkListResponse` に `cover_image_url: str | None` フィールドを追加する
- [x] 2.4 `WorkResponse` に `cover_image_url: str | None` フィールドを追加する
- [x] 2.5 `PerformerResponse` に `cover_image_url: str | None` フィールドを追加する
- [x] 2.6 work / performer の CRUD 関数で `cover_image_url` を `cover_image_path` から生成してセットする（`/static/covers/{path}` 形式）

## 3. バックエンド: 画像アップロードエンドポイント

- [x] 3.1 `uploads/covers/` ディレクトリ作成処理を `main.py` の起動時に追加する
- [x] 3.2 FastAPI `StaticFiles` を `/static/covers` にマウントする（`main.py`）
- [x] 3.3 `POST /works/{id}/cover` エンドポイントを実装する（multipart, `UploadFile` で受け取り `uploads/covers/works/{id}{ext}` に保存）
- [x] 3.4 `DELETE /works/{id}/cover` エンドポイントを実装する（ファイル削除 + `cover_image_path` を null にする）
- [x] 3.5 `POST /performers/{id}/cover` エンドポイントを実装する（`uploads/covers/performers/{id}{ext}` に保存）
- [x] 3.6 `DELETE /performers/{id}/cover` エンドポイントを実装する

## 4. フロントエンド: 型定義・API クライアント更新

- [x] 4.1 `types.ts` の `WorkListItem` と `Performer` に `cover_image_url: string | null` を追加する
- [x] 4.2 `api/client.ts` に `works.uploadCover(id, file)` メソッドを追加する
- [x] 4.3 `api/client.ts` に `works.deleteCover(id)` メソッドを追加する
- [x] 4.4 `api/client.ts` に `performers.uploadCover(id, file)` メソッドを追加する
- [x] 4.5 `api/client.ts` に `performers.deleteCover(id)` メソッドを追加する

## 5. フロントエンド: タイルコンポーネント作成

- [x] 5.1 `CoverUploadZone` コンポーネントを作成する（ファイル選択・ドラッグ&ドロップ・クリップボード貼り付け対応、`onUpload(file: File)` コールバック受け取り）
- [x] 5.2 `WorkTile` コンポーネントを作成する（16:9 カバー画像 + タイトル + 出演者名 + スコア）
- [x] 5.3 `PerformerTile` コンポーネントを作成する（16:9 カバー画像 + 名前 + 出演作品数 + スコア）
- [x] 5.4 タイルグリッドの CSS (inline style) ロジックを `useTileGridStyle(maxCols)` フックとして実装する（design.md の計算式を使用）

## 6. フロントエンド: グリッド最大列数設定

- [x] 6.1 `useTileMaxColumns()` フックを作成する（localStorage の `tileGridMaxColumns` を読み書き、デフォルト 6）
- [x] 6.2 `SettingsPage.tsx` に「表示設定」セクションを追加し、グリッド最大列数を数値入力で設定できるようにする（範囲: 2〜12）

## 7. フロントエンド: 一覧ページの更新

- [x] 7.1 `WorksPage.tsx` のテーブル部分を `WorkTile` タイルグリッドに置き換える（`ColumnConfigPopover` の import と使用箇所を削除）
- [x] 7.2 `PerformersPage.tsx` のテーブル部分を `PerformerTile` タイルグリッドに置き換える（`ColumnConfigPopover` の import と使用箇所を削除）
- [x] 7.3 `PerformerDetailPage.tsx` の出演作品セクションを `WorkTile` タイルグリッドに置き換える
- [x] 7.4 `buildWorkColumns` / `buildPerformerColumns` 関数を削除する（WorksPage, PerformersPage から）

## 8. フロントエンド: 詳細ページのカバー画像 UI

- [x] 8.1 `WorkDetailPage.tsx` にカバー画像表示エリアと `CoverUploadZone` を追加する（画像あり: 画像 + 削除ボタン表示、画像なし: アップロードゾーン表示）
- [x] 8.2 `PerformerDetailPage.tsx` にカバー画像表示エリアと `CoverUploadZone` を追加する

## 9. クリーンアップ

- [x] 9.1 `ColumnConfigPopover.tsx` コンポーネントファイルを削除する
- [x] 9.2 `hooks/useColumnConfig.ts` ファイルを削除する
- [x] 9.3 削除したコンポーネント・フックの import を全ファイルから除去する
- [x] 9.4 TypeScript の型チェックエラーがないことを確認する（`docker compose exec frontend npm run typecheck` 等）
- [x] 9.5 バックエンドのテスト・リントが通ることを確認する（`docker compose exec backend ruff check .` / `pytest`）
