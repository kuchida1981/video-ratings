## Context

`backend/app/routers/imports.py` の `execute_import` は、CSVの各行を順に処理し、出演者の `performer_id` が `null`（プレビュー時にDB未登録と判定された新規出演者）の場合、無条件で `Performer` を新規作成している。プレビューはDBとの照合のみ行い、CSV内の行同士の重複は見ないため、同名の新規出演者が複数行にあると行数分のPerformerが作成される。

`backend/app/models/models.py` では `Work.work_performers` に `cascade="all, delete-orphan"` が設定されている一方、`Performer.work_performers` には何も設定されていない。`WorkPerformer.performer_id` は複合主キーの一部（NOT NULL）であるため、SQLAlchemyが親削除時にデフォルトで試みる「子のFKをNULLにする」処理が失敗し、`delete_performer` で未捕捉の例外（500）になる。`performer-management` spec の既存要求（出演者削除時に作品との関連付けのみ削除し作品自体は残す）は変わっておらず、実装がそれを満たしていない状態。

テスト基盤は現状、Pydanticスキーマ検証とモックのみの純粋ロジックテストに限られ、DBやAPIルーターに触れるテストが一つもない（`conftest.py` も存在しない）。プロジェクトはPostgres専用構成（`JSONB`型, `psycopg2-binary`）で、`httpx`（TestClient用）も未導入。

## Goals / Non-Goals

**Goals:**
- 同一インポートバッチ内で同名の新規出演者が複数行に出現しても、Performerは1件だけ作成される
- 出演作が1件以上ある出演者の削除が成功し、作品自体は削除されず関連付け（WorkPerformer）のみ削除される
- 上記2点を、最小限のDBセッションfixtureを使った軽量な結合テストで担保する

**Non-Goals:**
- 同名だが別人であるケースをユーザーが区別できるUI（CSVバッチ内重複に対する「別人」選択）は対象外。今回は常に同一人物として統合する
- FastAPI `TestClient`／`httpx` を用いたAPIレベルのテスト基盤導入は対象外。router関数をDBセッションと共に直接呼び出す方式に留める
- 一般的なテストインフラ整備（SQLite代替、testcontainers導入など）は対象外。既存のPostgres（docker-compose）にトランザクションロールバックで隔離する最小構成のみ追加する

## Decisions

### 1. バッチ内重複防止はリクエストスコープのメモ化で実装する

`execute_import` 内に `dict[str, Performer]` のローカル変数を用意し、新規作成したPerformerを名前をキーに記録する。以降の行で同名・新規（`performer_id is None`）の出演者が現れたら、再作成せずキャッシュを再利用する。

行ごとの `try/except` + `db.rollback()` は既存の挙動を維持する。ロールバックされた行でキャッシュに追加したキーは、その行の except 節で取り除く（その行限定の追加分のみ取り除けば、他行で確定したキャッシュは保持される）。これにより:
- ロールバックされた行のPerformerを後続行が誤って参照する不整合を防ぐ
- 同一行内に同名が複数回出現するケース（CSV入力ミス）も自然に解決される

代替案として「事前に全行をスキャンしてユニークな新規出演者名を一括作成し、その後にWork処理を行う」方式（行とPerformer作成の分離）も検討したが、既存の行単位try/exceptループ構造を大きく変えずに最小差分で直せるメモ化方式を採用する。

### 2. Performerの削除カスケードは `Work` と対称にする

`Performer.work_performers` に `cascade="all, delete-orphan"` を追加する。`WorkPerformer` は中間テーブルであり、`Work` 側に同カスケードが既にあるため、対称性のある自然な修正。DBスキーマ変更は不要（ORMリレーション定義のみ）。

### 3. テストは新規DBセッションfixture1つに統一し、router関数を直接呼び出す

`backend/tests/conftest.py` に、`app.database.engine` にバインドしたSQLAlchemy `Session` を返すfixtureを追加する。各テストはトランザクション内で実行し、テスト後に必ず `rollback()` して開発用DBを汚さない。

このfixtureを使い、`delete_performer(performer_id, db)` と `execute_import(request, db)` をHTTPレイヤーを介さず直接呼び出してテストする。`TestClient`/`httpx` は導入しない。

## Risks / Trade-offs

- [同名・別人のケースが誤って統合される] → ユーザーの判断により許容範囲内とする（Non-Goals参照）。発生時は出演者詳細ページで別名/分離の手動修正で対応可能
- [テストがPostgres到達可能性に依存する] → 既存の開発フロー（docker-compose経由でbackendを動かす）と一致させ、`docker compose exec backend pytest` を実行手順とする
- [router関数を直接呼ぶテストはHTTP層（実際に204/500が返るか等）を検証しない] → 今回はORM/DBレベルの挙動（WorkPerformer削除・Work生存・Performer重複なし）を担保することが目的であり、HTTPステータスの検証は対象外と判断

## Migration Plan

DBスキーマ変更・Alembicマイグレーションは不要。コード変更のみをデプロイすればよい。テストは `docker compose exec backend pytest` で実行する。
