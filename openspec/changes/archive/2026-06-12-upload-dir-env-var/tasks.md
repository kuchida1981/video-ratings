## 1. 設定クラスの更新

- [x] 1.1 `backend/app/config.py` の `Settings` クラスに `upload_dir: str = "uploads"` フィールドを追加する

## 2. バックエンドコードの修正

- [x] 2.1 `backend/app/main.py` の `COVERS_DIR = Path("uploads/covers")` を `Path(settings.upload_dir) / "covers"` に変更する（`settings` のインポートも追加）
- [x] 2.2 `backend/app/routers/data.py` の `COVERS_DIR = Path("uploads/covers")` を `Path(settings.upload_dir) / "covers"` に変更する（`settings` のインポートも追加）
- [x] 2.3 `backend/app/services/cover_service.py` の `Path("uploads/covers")` を `Path(settings.upload_dir) / "covers"` に変更する（3箇所）

## 3. 設定ファイルの更新

- [x] 3.1 `.env.example` に `UPLOAD_DIR` エントリを追加する（本番環境では絶対パス `/var/lib/video-ratings/uploads` を使用する旨をコメントで記載）
