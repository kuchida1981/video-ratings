## Context

作品詳細ページの `WorkFile` テーブルには `path` カラムがあり、`smb://host/share/path` 形式の URL が登録される。現状はテキスト表示のみで再生機能は存在しない。バックエンドの Docker コンテナは Tailscale 経由で Synology NAS（`synology-nas` / `100.65.90.127`）の SMB ポート（445）への疎通・DNS 解決が確認済み。

## Goals / Non-Goals

**Goals:**
- `smb://` URL を持つ WorkFile をバックエンドプロキシ経由でブラウザにストリーミング再生する
- HTTP Range request に対応してシーク操作を可能にする
- SMB 認証情報を環境変数で管理する
- 作品詳細ページでインライン展開の動画プレイヤーを提供する

**Non-Goals:**
- SMB 以外のプロトコル（FTP、WebDAV 等）への対応
- トランスコード・フォーマット変換
- 再生位置の保存
- 複数ユーザーの同時再生の最適化（コネクションプールは単純実装で可）

## Decisions

### D1: バックエンドプロキシ方式を採用する

**選択**: バックエンド FastAPI が SMB ファイルを読み取り、HTTP ストリームとして配信する  
**理由**: ブラウザは `smb://` プロトコルを直接扱えないため必須。`smbprotocol` ライブラリを使うことでホスト側のマウント操作不要。  
**代替案**: ホスト側で SMB マウントして Docker ボリューム共有 → マウント管理が運用上の負担になるため却下。

### D2: `smbprotocol` ライブラリを使用する

**選択**: `smbprotocol`（jborean93/smbprotocol）  
**理由**: SMBv2/v3 対応、純 Python、活発にメンテナンスされている。Synology NAS は SMBv2/v3 をサポートしている。  
**代替案**: `pysmb` → SMBv1 中心で古い。`impacket` → セキュリティ用途向けで重い。

### D3: HTTP Range request 対応を実装する

**選択**: `Range` ヘッダーを解析し `HTTP 206 Partial Content` で応答する  
**理由**: ブラウザの `<video>` タグはシーク時に Range request を発行する。対応しないとシークが効かない。  
**実装**: SMB ファイルの `seek()` と `read(chunk_size)` を組み合わせて部分読み取りを実装。

### D4: 認証情報は環境変数で管理する

**選択**: `SMB_USERNAME`, `SMB_PASSWORD` を環境変数から読む  
**理由**: Docker Compose の `environment` セクションに記載するシンプルな方式で十分。将来的にシークレットマネージャーへの移行も容易。

### D5: フロントエンドはインライン展開プレイヤー

**選択**: ファイル行の下に `<video>` タグをトグル展開する  
**理由**: ページ遷移なしに再生でき、複数ファイルを順番に確認しやすい。モーダルより実装がシンプル。

## Risks / Trade-offs

- **SMB 接続のオーバーヘッド**: リクエストごとに SMB セッションを張る → 動画再生中は Range request が頻繁に来るため、接続の再利用が望ましい。初回実装はシンプルに都度接続し、パフォーマンス問題が出れば接続プールを導入する。
- **ホスト名依存**: `synology-nas` が Tailscale MagicDNS 経由で解決できることを前提とする。DNS が使えない環境では IP 直打ちが必要 → URL に IP を入れることで回避可能。
- **大ファイルのメモリ**: チャンク読み取り（64KB 単位）でメモリ消費を抑える。
- **認証情報の平文管理**: `.env` ファイルを `.gitignore` に追加して漏洩を防ぐ。

## Migration Plan

1. `requirements.txt` に `smbprotocol` を追加してコンテナを再ビルド
2. `docker-compose.yml` の backend に `SMB_USERNAME`, `SMB_PASSWORD` を追加（または `.env` 経由）
3. バックエンドエンドポイントを追加・デプロイ
4. フロントエンドの再生ボタン UI を追加

ロールバック: エンドポイントを削除しフロントの再生ボタンを除去するのみ。データモデル変更なし。

## Open Questions

（なし）
