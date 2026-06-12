## Context

現在、アップロードファイルの保存先パス `uploads/covers` がバックエンドの3ファイルにハードコードされている。開発・Docker 環境では相対パスで問題ないが、本番デプロイ時には `/var/lib/video-ratings/uploads/` のような絶対パスに変更したい。

変更箇所:
- `backend/app/main.py` — `COVERS_DIR = Path("uploads/covers")`
- `backend/app/routers/data.py` — `COVERS_DIR = Path("uploads/covers")`
- `backend/app/services/cover_service.py` — `Path("uploads/covers")` が3箇所

## Goals / Non-Goals

**Goals:**
- `UPLOAD_DIR` 環境変数でアップロードディレクトリのベースパスを設定できるようにする
- 既存の開発環境・Docker 環境の動作を一切変えない（デフォルト値 `"uploads"` を維持）

**Non-Goals:**
- アップロードロジック自体の変更
- `covers` サブディレクトリ構造の変更（`{upload_dir}/covers/` は維持）
- 複数のアップロード先に対応すること

## Decisions

**設定キーの粒度: `upload_dir` をベースパスとする**

`UPLOAD_DIR=/var/lib/video-ratings/uploads` と設定すると、実際の保存先は `{upload_dir}/covers/{entity_type}/` になる。サブディレクトリ (`covers/`) はコードで固定のままとする。

代替案として `COVERS_DIR` を直接設定する方法もあるが、将来的に他の種別のアップロード（例: 動画サムネイル等）が加わった場合にベースパスを一箇所で管理できる方が保守しやすい。

**`settings` オブジェクト経由で参照する**

モジュールレベルの定数 `COVERS_DIR = Path("uploads/covers")` を廃止し、関数内または `main.py` のマウント処理で `Path(settings.upload_dir) / "covers"` として参照する。`cover_service.py` も同様に `settings` をインポートして参照する。

## Risks / Trade-offs

- [設定漏れリスク] 本番環境で `UPLOAD_DIR` を設定し忘れると、uvicorn の起動ディレクトリ直下の `uploads/` に書き込まれる → `.env.example` にコメント付きで記載し、ドキュメントでも明示する
- [パス存在チェック] 指定したディレクトリが存在しない場合、ファイル保存時にエラーになる → install.sh でディレクトリを事前作成することで対処（アプリ側でのバリデーションは追加しない）
