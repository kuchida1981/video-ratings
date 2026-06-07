### Requirement: CI ワークフローの自動実行
システムは GitHub への push または Pull Request 作成・更新時に、バックエンドおよびフロントエンドの CI ジョブを自動実行しなければならない（SHALL）。

#### Scenario: push 時に CI が起動する
- **WHEN** ユーザーが任意のブランチに push する
- **THEN** GitHub Actions が `ci.yml` ワークフローを起動する

#### Scenario: PR 作成・更新時に CI が起動する
- **WHEN** Pull Request が作成または更新される
- **THEN** GitHub Actions が `ci.yml` ワークフローを起動する

### Requirement: バックエンド CI ジョブ
バックエンド job は `backend/**` 配下のファイルが変更された場合にのみ実行されなければならない（SHALL）。Python 3.12 環境で ruff lint・ruff format チェック・pytest unit テストを順に実行する。

#### Scenario: バックエンドファイル変更時に backend job が実行される
- **WHEN** `backend/**` 配下のファイルが変更された push/PR がトリガーされる
- **THEN** backend job が起動し ruff lint → ruff format check → pytest を実行する

#### Scenario: バックエンドファイル非変更時に backend job がスキップされる
- **WHEN** `backend/**` 配下のファイルが変更されていない
- **THEN** backend job はスキップされる

#### Scenario: ruff lint エラーがある場合 CI が失敗する
- **WHEN** backend job が実行され ruff lint がエラーを検出する
- **THEN** CI ステータスが failure となる

#### Scenario: pytest unit テストが失敗した場合 CI が失敗する
- **WHEN** backend job が実行され pytest unit テストが失敗する
- **THEN** CI ステータスが failure となる

#### Scenario: pytest カバレッジレポートが出力される
- **WHEN** backend job が正常完了する
- **THEN** カバレッジレポートが CI ログに表示される

### Requirement: フロントエンド CI ジョブ
フロントエンド job は `frontend/**` 配下のファイルが変更された場合にのみ実行されなければならない（SHALL）。Node.js 環境で ESLint・tsc 型チェック・Vitest を順に実行する。

#### Scenario: フロントエンドファイル変更時に frontend job が実行される
- **WHEN** `frontend/**` 配下のファイルが変更された push/PR がトリガーされる
- **THEN** frontend job が起動し ESLint → tsc → vitest を実行する

#### Scenario: フロントエンドファイル非変更時に frontend job がスキップされる
- **WHEN** `frontend/**` 配下のファイルが変更されていない
- **THEN** frontend job はスキップされる

#### Scenario: ESLint エラーがある場合 CI が失敗する
- **WHEN** frontend job が実行され ESLint がエラーを検出する
- **THEN** CI ステータスが failure となる

#### Scenario: TypeScript 型エラーがある場合 CI が失敗する
- **WHEN** frontend job が実行され tsc が型エラーを検出する
- **THEN** CI ステータスが failure となる

### Requirement: backend と frontend job の並列実行
backend job と frontend job は互いに依存せず並列実行されなければならない（SHALL）。

#### Scenario: 両ジョブが並列で実行される
- **WHEN** `backend/**` と `frontend/**` の両方のファイルが変更された push がトリガーされる
- **THEN** backend job と frontend job が並列で起動する

### Requirement: 依存関係キャッシュ
pip および npm の依存関係はキャッシュを利用して CI の実行時間を短縮しなければならない（SHALL）。

#### Scenario: pip 依存関係がキャッシュされる
- **WHEN** backend job が実行される
- **THEN** `pyproject.toml` をキャッシュキーとして pip 依存関係がキャッシュされる

#### Scenario: npm 依存関係がキャッシュされる
- **WHEN** frontend job が実行される
- **THEN** `package-lock.json` をキャッシュキーとして node_modules がキャッシュされる
