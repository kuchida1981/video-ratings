## 1. バックエンド依存・設定

- [ ] 1.1 `pyproject.toml` の dependencies に `smbprotocol>=1.13.0` を追加する
- [ ] 1.2 `backend/app/config.py` に `SMB_USERNAME` / `SMB_PASSWORD` の設定項目を追加する
- [ ] 1.3 `docker-compose.yml` の backend サービスに `SMB_USERNAME` / `SMB_PASSWORD` の環境変数を追加する（値はコメントで案内）

## 2. SMB ストリーミングエンドポイント実装

- [ ] 2.1 `smb://host/share/path` をパースするユーティリティ関数を実装する（`backend/app/services/smb.py` 等）
- [ ] 2.2 SMB ファイルを HTTP Range request に対応しながらストリーミングするジェネレータ関数を実装する
- [ ] 2.3 `GET /works/{work_id}/files/{file_id}/stream` エンドポイントを `backend/app/routers/works.py` に追加する
  - WorkFile が存在しなければ 404
  - パスが `smb://` で始まらなければ 400
  - `SMB_USERNAME` / `SMB_PASSWORD` が未設定なら 503
  - Range ヘッダーを解析して HTTP 206 で部分レスポンス

## 3. フロントエンド再生 UI

- [ ] 3.1 `WorkDetailPage.tsx` のファイルリストで `smb://` URL を判定するヘルパー（1 行）を追加する
- [ ] 3.2 `smb://` ファイル行に ▶ トグルボタンを追加する
- [ ] 3.3 トグル状態を管理する state を追加する（開いているファイル ID を管理）
- [ ] 3.4 展開時にファイル行の下に `<video controls>` タグをレンダリングし、`src` を `/api/works/{work_id}/files/{file_id}/stream` に設定する

## 4. 動作確認

- [ ] 4.1 コンテナを再ビルドして `smbprotocol` がインストールされることを確認する
- [ ] 4.2 SMB 認証情報を設定し、stream エンドポイントに curl で Range request を送って 206 レスポンスが返ることを確認する
- [ ] 4.3 作品詳細ページで ▶ ボタンが `smb://` ファイルのみに表示されることをユーザーが確認する
- [ ] 4.4 ▶ ボタンクリックで動画が再生され、シークが正常に動作することをユーザーが確認する
