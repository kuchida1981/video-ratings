## ADDED Requirements

### Requirement: SMB ファイルのストリーミング配信
バックエンドは `smb://` スキームの WorkFile パスに対して、SMB サーバーからファイルを読み取り HTTP ストリームとして配信する SHALL。配信エンドポイントは `GET /works/{work_id}/files/{file_id}/stream` とする。

#### Scenario: 正常なストリーミング開始
- **WHEN** `smb://` パスを持つ WorkFile の stream エンドポイントに GET リクエストを送る
- **THEN** HTTP 200 (または Range 指定時は 206) でファイル内容がストリーミングされる

#### Scenario: Range request によるシーク
- **WHEN** `Range: bytes=N-M` ヘッダー付きで stream エンドポイントにリクエストを送る
- **THEN** HTTP 206 Partial Content で指定バイト範囲のデータが返される

#### Scenario: smb:// 以外のパスへのアクセス拒否
- **WHEN** `smb://` で始まらない WorkFile の stream エンドポイントにリクエストを送る
- **THEN** HTTP 400 が返される

#### Scenario: 存在しない WorkFile へのアクセス
- **WHEN** 存在しない file_id で stream エンドポイントにリクエストを送る
- **THEN** HTTP 404 が返される

### Requirement: SMB 認証情報の環境変数管理
システムは `SMB_USERNAME` および `SMB_PASSWORD` 環境変数から SMB 認証情報を読み取る SHALL。

#### Scenario: 認証情報が設定されている場合の接続
- **WHEN** `SMB_USERNAME` と `SMB_PASSWORD` が環境変数に設定されている
- **THEN** バックエンドはその認証情報で SMB サーバーに接続する

#### Scenario: 認証情報が未設定の場合
- **WHEN** `SMB_USERNAME` または `SMB_PASSWORD` が未設定
- **THEN** stream エンドポイントは HTTP 503 を返す

### Requirement: 作品詳細ページの SMB ファイル再生 UI
作品詳細ページのファイルリストで `smb://` URL を持つファイルには再生ボタンを表示する SHALL。

#### Scenario: 再生ボタンの表示
- **WHEN** ファイルパスが `smb://` で始まる
- **THEN** ファイル行に再生（▶）ボタンが表示される

#### Scenario: インライン動画プレイヤーの展開
- **WHEN** 再生ボタンをクリックする
- **THEN** ファイル行の下に `<video>` プレイヤーがインライン展開され、stream エンドポイントから再生が開始される

#### Scenario: 再生ボタンの再クリックで閉じる
- **WHEN** プレイヤーが展開中に再生ボタンをクリックする
- **THEN** `<video>` プレイヤーが折りたたまれる
