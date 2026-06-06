## Why

作品詳細ページに登録された SMB ファイルパスは現状テキスト表示のみで、実際の動画を視聴するには別途外部プレイヤーを起動する必要がある。バックエンドから SMB サーバーへの疎通が Tailscale 経由で確認済みであり、ブラウザ内での直接再生が実現可能なタイミングであるため、この機能を追加する。

## What Changes

- バックエンドに SMB ストリーミングエンドポイント（`GET /works/{work_id}/files/{file_id}/stream`）を新設する
- `smbprotocol` ライブラリを追加して SMB サーバーへの接続・認証・ファイル読み出しを実装する
- SMB 認証情報（ユーザー名・パスワード）を環境変数（`SMB_USERNAME`, `SMB_PASSWORD`）で管理する
- 作品詳細ページのファイルリストで `smb://` で始まるパスに再生ボタンを表示し、クリックでインライン動画プレイヤーを展開する

## Capabilities

### New Capabilities

- `smb-video-streaming`: SMB URL を持つ WorkFile をバックエンド経由でブラウザにストリーミング再生する機能

### Modified Capabilities

（なし）

## Impact

- **バックエンド**: 新規エンドポイント追加、`smbprotocol` 依存追加、環境変数 `SMB_USERNAME` / `SMB_PASSWORD` が必要
- **フロントエンド**: `WorkDetailPage.tsx` のファイルリスト表示部分を変更
- **インフラ**: `docker-compose.yml` の backend サービスに SMB 認証情報を環境変数として追加
