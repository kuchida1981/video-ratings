# Spec: role-based-access

## Purpose

viewer / editor のロールベース認可（API レベル + フロントエンド UI 制御）を提供する。

## Requirements

### Requirement: viewer ロールは読み取り操作のみ許可される
`role == "viewer"` のユーザーは、API の読み取り操作（GET）のみ許可されなければならない（SHALL）。書き込み操作（POST, PUT, PATCH, DELETE）は `/api/auth/*` を除き 403 Forbidden を返さなければならない（SHALL）。

#### Scenario: viewer が作品一覧を取得する
- **WHEN** viewer ロールのユーザーが `GET /api/works` にリクエストする
- **THEN** 作品一覧が正常に返る

#### Scenario: viewer が作品を作成しようとする
- **WHEN** viewer ロールのユーザーが `POST /api/works` にリクエストする
- **THEN** HTTP 403 Forbidden が返る

#### Scenario: viewer が作品を更新しようとする
- **WHEN** viewer ロールのユーザーが `PUT /api/works/1` にリクエストする
- **THEN** HTTP 403 Forbidden が返る

#### Scenario: viewer が作品を削除しようとする
- **WHEN** viewer ロールのユーザーが `DELETE /api/works/1` にリクエストする
- **THEN** HTTP 403 Forbidden が返る

#### Scenario: viewer がエクスポートを実行する
- **WHEN** viewer ロールのユーザーが `GET /api/export` にリクエストする
- **THEN** エクスポートデータが正常に返る

### Requirement: editor ロールはすべての操作が許可される
`role == "editor"` のユーザーは、すべての API 操作（GET, POST, PUT, PATCH, DELETE）が許可されなければならない（SHALL）。

#### Scenario: editor が作品を作成する
- **WHEN** editor ロールのユーザーが `POST /api/works` にリクエストする
- **THEN** 作品が正常に作成される

#### Scenario: editor が作品を削除する
- **WHEN** editor ロールのユーザーが `DELETE /api/works/1` にリクエストする
- **THEN** 作品が正常に削除される

### Requirement: フロントエンドで viewer の編集 UI を非表示にする
viewer ロールのユーザーに対して、作成・編集・削除に関する UI 要素を非表示にしなければならない（SHALL）。ボタンを disabled にするのではなく、DOM から除外する。

#### Scenario: viewer が作品一覧ページを表示する
- **WHEN** viewer ロールのユーザーが作品一覧ページを表示する
- **THEN** 「新規作成」ボタンが表示されない

#### Scenario: viewer が作品詳細ページを表示する
- **WHEN** viewer ロールのユーザーが作品詳細ページを表示する
- **THEN** 編集フォーム、削除ボタン、タグ追加/削除、出演者追加/削除、ファイル追加/削除、カバー画像アップロード/削除などの編集 UI が表示されない。閲覧用の情報のみが表示される

#### Scenario: viewer が出演者一覧ページを表示する
- **WHEN** viewer ロールのユーザーが出演者一覧ページを表示する
- **THEN** 「新規作成」ボタンとインライン編集機能が表示されない

#### Scenario: viewer が設定ページを表示する
- **WHEN** viewer ロールのユーザーが設定ページを表示する
- **THEN** タグカテゴリ・タグ・カスタムフィールドの作成・編集・削除・並べ替え UI が表示されない。インポート・エクスポート操作のうち、インポートが表示されない

#### Scenario: editor が作品詳細ページを表示する
- **WHEN** editor ロールのユーザーが作品詳細ページを表示する
- **THEN** すべての編集 UI（編集フォーム、削除ボタン等）が表示される

### Requirement: サイドバーにログインユーザー情報を表示する
サイドバーの下部にログイン中のユーザー名を表示しなければならない（SHALL）。

#### Scenario: ログイン中のユーザー名が表示される
- **WHEN** ログイン済みのユーザーがアプリケーションを使用する
- **THEN** サイドバーの下部にユーザー名が表示される
