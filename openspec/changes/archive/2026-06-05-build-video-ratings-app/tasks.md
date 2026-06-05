## 1. プロジェクト基盤・Docker環境

- [x] 1.1 リポジトリのディレクトリ構成を作成する（backend/, frontend/, docker/）
- [x] 1.2 docker-compose.yml を作成する（db / backend / frontend の3サービス）
- [x] 1.3 PostgreSQL 16 の初期設定（docker-compose の db サービス、healthcheck）
- [x] 1.4 backend の Dockerfile を作成する（Python 3.12, uvicorn, hot reload）
- [x] 1.5 frontend の Dockerfile を作成する（Node, Vite dev server, HMR）
- [x] 1.6 `docker compose up` で全サービスが起動することを確認する

## 2. バックエンド基盤（FastAPI）

- [x] 2.1 FastAPI プロジェクトを初期化する（pyproject.toml, 依存パッケージ定義）
- [x] 2.2 SQLAlchemy + Alembic のセットアップ（接続設定、マイグレーション管理）
- [x] 2.3 データベースモデルを実装する（works, performers, work_performers, work_files）
- [x] 2.4 タグ関連モデルを実装する（tag_categories, tags, work_tags, performer_tags）
- [x] 2.5 custom_field_definitions モデルを実装する
- [x] 2.6 works.custom_fields に JSONB + GIN index を設定する
- [x] 2.7 初期マイグレーションを作成・適用する

## 3. 作品 CRUD API

- [x] 3.1 作品一覧取得 API を実装する（GET /works）
- [x] 3.2 作品詳細取得 API を実装する（GET /works/{id}）
- [x] 3.3 作品作成 API を実装する（POST /works）
- [x] 3.4 作品更新 API を実装する（PUT /works/{id}）
- [x] 3.5 作品削除 API を実装する（DELETE /works/{id}）
- [x] 3.6 作品ファイルパスの追加・削除 API を実装する（POST/DELETE /works/{id}/files）

## 4. 出演者 CRUD API

- [x] 4.1 出演者一覧・詳細・作成・更新・削除 API を実装する
- [x] 4.2 出演者に作品を紐づける API を実装する（POST /works/{id}/performers）
- [x] 4.3 主演フラグの設定 API を実装する（PATCH /works/{id}/performers/{performer_id}）
- [x] 4.4 出演者が紐づく作品一覧 API を実装する（GET /performers/{id}/works）

## 5. タグ評価 API

- [x] 5.1 タグカテゴリの CRUD API を実装する（entity_type・is_multi_select 対応）
- [x] 5.2 タグの CRUD API を実装する（score nullable 対応）
- [x] 5.3 作品へのタグ付け・取り外し API を実装する（POST/DELETE /works/{id}/tags）
- [x] 5.4 出演者へのタグ付け・取り外し API を実装する（POST/DELETE /performers/{id}/tags）
- [x] 5.5 is_multi_select=false のカテゴリで既存タグを自動的に外すロジックを実装する
- [x] 5.6 ScoreCalculator サービスを実装する（作品スコア + 主演出演者スコア）
- [x] 5.7 作品詳細 API のレスポンスに合計スコアを含める

## 6. カスタム項目 API

- [x] 6.1 カスタム項目定義の CRUD API を実装する（GET/POST/PUT/DELETE /custom-field-definitions）
- [x] 6.2 作品のカスタム項目値の設定 API を実装する（PATCH /works/{id}/custom-fields）
- [x] 6.3 カスタム項目定義削除時に全 works.custom_fields から該当キーを削除する処理を実装する

## 7. 検索 API

- [x] 7.1 キーワード検索（作品名・メーカー・シリーズ・出演者名・ふりがな）を実装する
- [x] 7.2 タグ AND フィルタを実装する
- [x] 7.3 メーカー・シリーズフィルタを実装する
- [x] 7.4 カスタム項目フィルタを実装する（text: LIKE, number: 範囲, date: 範囲）
- [x] 7.5 ソート（合計スコア順・登録日順）を実装する
- [x] 7.6 全条件を組み合わせた検索エンドポイント（GET /works/search）を完成させる

## 8. CSVインポート API

- [x] 8.1 CSV アップロード・パース・バリデーション API を実装する（POST /import/preview）
- [x] 8.2 プレビュー確定・インポート実行 API を実装する（POST /import/execute）
- [x] 8.3 出演者名の重複チェック（既存出演者の再利用）ロジックを実装する
- [x] 8.4 performer_furiganas 列の省略・部分入力に対応する

## 9. フロントエンド基盤（React + TypeScript）

- [x] 9.1 Vite + React + TypeScript プロジェクトを初期化する
- [x] 9.2 shadcn/ui をセットアップする
- [x] 9.3 React Router でルーティングを設定する（作品一覧・詳細・出演者・タグ管理・設定）
- [x] 9.4 バックエンド API クライアントを実装する（fetch wrapper または axios）

## 10. 作品管理 UI

- [x] 10.1 作品一覧画面を実装する（テーブル表示・スコア表示）
- [x] 10.2 作品登録・編集フォームを実装する（カスタム項目の動的フォーム対応）
- [x] 10.3 作品詳細画面を実装する（ファイルパス・出演者・タグ・スコア表示）
- [x] 10.4 ファイルパス管理 UI を実装する（追加・削除・display_name 設定）
- [x] 10.5 CSV インポート画面を実装する（ファイル選択・プレビュー表示・確定ボタン）

## 11. 出演者管理 UI

- [x] 11.1 出演者一覧・詳細画面を実装する
- [x] 11.2 出演者登録・編集フォームを実装する（名前・ふりがな）
- [x] 11.3 出演者への出演者タグ付け UI を実装する（カテゴリ別、is_multi_select 対応）
- [x] 11.4 出演者詳細に出演作品一覧を表示する

## 12. タグ・カテゴリ管理 UI

- [x] 12.1 タグカテゴリ管理画面を実装する（entity_type・is_multi_select 設定 UI）
- [x] 12.2 タグ管理画面を実装する（スコア設定・null 対応）
- [x] 12.3 作品詳細画面に作品タグ付け UI を実装する（カテゴリ別グループ表示）

## 13. カスタム項目管理 UI

- [x] 13.1 カスタム項目定義管理画面を実装する（追加・削除・型選択）

## 14. 検索 UI

- [x] 14.1 検索バー（キーワード入力）を実装する
- [x] 14.2 タグフィルタ UI を実装する（複数選択）
- [x] 14.3 メーカー・シリーズフィルタ UI を実装する
- [x] 14.4 カスタム項目フィルタ UI を実装する（型に応じたウィジェット）
- [x] 14.5 ソート切り替え UI を実装する
- [x] 14.6 フィルタリセット機能を実装する
