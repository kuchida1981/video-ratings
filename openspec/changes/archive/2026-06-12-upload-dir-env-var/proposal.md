## Why

デプロイ時にアップロードファイル（カバー画像等）の保存先をサーバー上の適切な場所（例: `/var/lib/video-ratings/uploads/`）に設定できる必要がある。現在は `uploads/covers` というパスがコード内に直書きされており、本番環境で使いやすい場所に変更できない。

## What Changes

- `backend/app/config.py` の `Settings` クラスに `upload_dir` フィールドを追加（環境変数 `UPLOAD_DIR`、デフォルト: `"uploads"`）
- `backend/app/main.py`、`backend/app/routers/data.py`、`backend/app/services/cover_service.py` 内のハードコードされた `Path("uploads/covers")` を `Path(settings.upload_dir) / "covers"` に置き換える
- `.env.example` に `UPLOAD_DIR` の記載と用途コメントを追加

## Capabilities

### New Capabilities

- `upload-dir-config`: アップロードディレクトリを環境変数 `UPLOAD_DIR` で設定できる機能

### Modified Capabilities

（なし。カバー画像のアップロード要件自体は変わらず、実装上の保存先のみ変更）

## Impact

- `backend/app/config.py`: `Settings` クラスに1フィールド追加
- `backend/app/main.py`: `COVERS_DIR` の定義を `settings` 参照に変更
- `backend/app/routers/data.py`: `COVERS_DIR` の定義を `settings` 参照に変更
- `backend/app/services/cover_service.py`: `Path("uploads/covers")` のハードコードを3箇所変更
- `.env.example`: `UPLOAD_DIR` エントリ追加
- デフォルト値 `"uploads"` により、既存の開発環境・Docker 環境への影響はゼロ
