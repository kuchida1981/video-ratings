# upload-dir-config Specification

## Purpose
TBD - created by syncing change upload-dir-env-var. Update Purpose after archive.

## Requirements
### Requirement: アップロードディレクトリを環境変数で設定できる
システムは環境変数 `UPLOAD_DIR` でアップロードファイルの保存先ベースパスを設定できなければならない（SHALL）。`UPLOAD_DIR` が未設定の場合はデフォルト値 `uploads` を使用する。

#### Scenario: UPLOAD_DIR が設定されている場合
- **WHEN** 環境変数 `UPLOAD_DIR=/var/lib/video-ratings/uploads` が設定された状態でバックエンドを起動する
- **THEN** カバー画像は `/var/lib/video-ratings/uploads/covers/` 以下に保存される

#### Scenario: UPLOAD_DIR が未設定の場合
- **WHEN** 環境変数 `UPLOAD_DIR` が設定されていない状態でバックエンドを起動する
- **THEN** カバー画像は起動ディレクトリ直下の `uploads/covers/` 以下に保存され、既存の動作と変わらない
