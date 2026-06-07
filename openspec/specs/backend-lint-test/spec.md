# backend-lint-test

## Purpose

Backend の静的解析・フォーマット・テストカバレッジおよび pre-commit 自動チェックに関する仕様。ruff による lint/format チェック、ScoreCalculator のユニットテスト、カバレッジ閾値の強制、および pre-commit フックによる自動検証を定義する。

## Requirements

### Requirement: ruff lint チェック
backend コードは ruff の lint ルール（pycodestyle, pyflakes, isort 相当）に適合していなければならない（SHALL）。`ruff check app/` が 0 exit code で完了することが必要条件とする。

#### Scenario: lint エラーがある場合
- **WHEN** `ruff check app/` を実行し、未使用インポートやスタイル違反が存在する
- **THEN** コマンドが非 0 exit code で終了し、違反箇所を出力する

#### Scenario: lint エラーがない場合
- **WHEN** `ruff check app/` を実行し、違反がない
- **THEN** コマンドが 0 exit code で終了する

### Requirement: ruff format チェック
backend コードは ruff の format 規則に準拠していなければならない（SHALL）。`ruff format --check app/` が 0 exit code で完了することが必要条件とする。

#### Scenario: フォーマット未適用ファイルがある場合
- **WHEN** `ruff format --check app/` を実行し、未フォーマットのファイルが存在する
- **THEN** コマンドが非 0 exit code で終了し、対象ファイルを出力する

#### Scenario: 全ファイルがフォーマット済みの場合
- **WHEN** `ruff format --check app/` を実行し、全ファイルが規則に準拠している
- **THEN** コマンドが 0 exit code で終了する

### Requirement: ScoreCalculator のユニットテスト
`ScoreCalculator` クラスの全メソッドはユニットテストで検証されなければならない（SHALL）。テストは DB セッションを使用せず、フェイクモデルオブジェクトのみを使用する。

#### Scenario: タグスコアのみの作品スコア計算
- **WHEN** メインパフォーマーなし・タグスコア合計 30 の Work フェイクオブジェクトを渡す
- **THEN** `calculate_work_total_score` が 30 を返す

#### Scenario: メインパフォーマーのスコアが加算される
- **WHEN** メインパフォーマー（タグスコア 20）と作品タグスコア 10 の Work フェイクオブジェクトを渡す
- **THEN** `calculate_work_total_score` が 30 を返す

#### Scenario: メインパフォーマーなしの場合はパフォーマースコアが 0
- **WHEN** `is_main=False` のパフォーマーのみを持つ Work フェイクオブジェクトを渡す
- **THEN** `_get_main_performer_score` が 0 を返す

#### Scenario: スコアが None のタグは 0 として計算される
- **WHEN** `score=None` のタグを持つ Work フェイクオブジェクトを渡す
- **THEN** `calculate_work_total_score` が 0 を返す（None は無視）

### Requirement: カバレッジ閾値の強制
`pytest --cov=app` 実行時、カバレッジが閾値を下回る場合はテストが失敗しなければならない（SHALL）。

- `app/services/`: 95% 以上
- 全体（omit 適用後）: 80% 以上
- `app/routers/`, `app/main.py`, `app/database.py`, `alembic/` は計測対象から除外する

#### Scenario: カバレッジが閾値を満たす場合
- **WHEN** `pytest --cov=app --cov-fail-under=80` を実行し、カバレッジが 80% 以上
- **THEN** コマンドが 0 exit code で終了する

#### Scenario: カバレッジが閾値を下回る場合
- **WHEN** テスト対象コードの一部がテストされておらず、カバレッジが閾値未満
- **THEN** `pytest --cov-fail-under` が非 0 exit code で終了し、不足を報告する

### Requirement: pre-commit による自動チェック
`git commit` 実行時、ruff lint・ruff format・pytest unit テストが自動実行されなければならない（SHALL）。いずれかが失敗した場合、コミットがブロックされる。

#### Scenario: lint エラーがある状態でコミット
- **WHEN** ruff lint エラーを含むファイルをステージして `git commit` を実行する
- **THEN** pre-commit フックが失敗し、コミットがブロックされる

#### Scenario: 全チェックが通過した状態でコミット
- **WHEN** lint・format・unit テストが全て通過する状態で `git commit` を実行する
- **THEN** コミットが正常に完了する
