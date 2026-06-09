## 1. バックエンド: Pillow 追加

- [x] 1.1 `backend/pyproject.toml` の dependencies に `Pillow>=11.0.0` を追加する

## 2. バックエンド: 既存画像マイグレーションスクリプト

- [x] 2.1 `backend/scripts/__init__.py` を作成する（空ファイル）
- [x] 2.2 `backend/scripts/resize_covers.py` を作成する（`uploads/covers/` 以下の JPEG を走査し、幅 1200px 超のものを 1200px 幅・JPEG quality 85 で in-place リサイズする）

## 3. フロントエンド: CoverUploadZone にブラウザリサイズを追加

- [x] 3.1 `CoverUploadZone.tsx` の `handleFile` に Canvas API によるリサイズ処理を追加する（max 1200px 幅、JPEG 85%、1200px 以下は拡大しない）
- [x] 3.2 リサイズ後のファイルを `image.jpg` という名前の `File` オブジェクトとして `onUpload` に渡す

## 4. フロントエンド: タイルに lazy loading を追加

- [x] 4.1 `WorkTile.tsx` の `<img>` に `loading="lazy"` を追加する
- [x] 4.2 `PerformerTile.tsx` の `<img>` に `loading="lazy"` を追加する

## 5. コンテナリビルドとマイグレーション実行

- [x] 5.1 `docker compose build backend` でビルドし、`docker compose up -d backend` でコンテナを再起動する
- [x] 5.2 `docker compose exec backend python scripts/resize_covers.py` でマイグレーションを実行し、ログで件数を確認する
