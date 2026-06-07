# SMB Video Streaming Spec

## Purpose

SMB サーバー上の動画ファイルを HTTP ストリーミング経由で配信し、作品詳細ページからインライン再生できる機能を提供する。

## Requirements

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

---

### Requirement: SMB 認証情報の環境変数管理
システムは `SMB_USERNAME` および `SMB_PASSWORD` 環境変数から SMB 認証情報を読み取る SHALL。

#### Scenario: 認証情報が設定されている場合の接続
- **WHEN** `SMB_USERNAME` と `SMB_PASSWORD` が環境変数に設定されている
- **THEN** バックエンドはその認証情報で SMB サーバーに接続する

#### Scenario: 認証情報が未設定の場合
- **WHEN** `SMB_USERNAME` または `SMB_PASSWORD` が未設定
- **THEN** stream エンドポイントは HTTP 503 を返す

---

### Requirement: 作品詳細ページの SMB ファイル再生 UI
作品詳細ページのカバー画像エリアに、登録された smb:// ファイルの再生ボタンをオーバーレイ表示する SHALL。再生ボタンをタップすると動画が即全画面で再生される。

#### Scenario: smb:// ファイルが1件の場合の再生ボタン表示
- **WHEN** 作品に smb:// パスのファイルが1件登録されている
- **THEN** カバー画像エリアに ▶ ボタンが1つオーバーレイ表示される

#### Scenario: smb:// ファイルが複数の場合の再生ボタン表示
- **WHEN** 作品に smb:// パスのファイルが複数登録されている
- **THEN** カバー画像エリアに各ファイルの display_name またはパス末尾を表示した ▶ ボタンが縦に並んで表示される

#### Scenario: smb:// ファイルが存在しない場合
- **WHEN** 作品に smb:// パスのファイルが1件も登録されていない
- **THEN** カバー画像エリアには再生ボタンのオーバーレイは表示されない

#### Scenario: 再生ボタンのタップで即全画面再生
- **WHEN** カバー画像エリアの ▶ ボタンをタップする
- **THEN** 対応するファイルの stream エンドポイントからの動画再生が開始され、即座に全画面モードに移行する

#### Scenario: ファイルリストの既存再生ボタン
- **WHEN** ファイルパスが `smb://` で始まる
- **THEN** ファイルリスト行にも再生（▶）ボタンが引き続き表示される（フォールバック）
