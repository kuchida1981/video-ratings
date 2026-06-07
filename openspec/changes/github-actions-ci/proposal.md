## Why

直近のコミットで ruff/pytest（バックエンド）・ESLint/tsc/Vitest（フロントエンド）の lint/test 基盤を整備したが、現状は pre-commit フックによるローカル実行のみで、PR・push 時に CI で自動検証されない。GitHub Actions で同じチェックを CI として走らせることで、コード品質をリポジトリレベルで保証する。

## What Changes

- `.github/workflows/ci.yml` を新規作成し、push/PR トリガーで以下を実行するワークフローを追加
  - **バックエンド CI**: ruff lint・ruff format チェック・pytest（unit テスト + カバレッジレポート）
  - **フロントエンド CI**: ESLint・tsc（型チェック）・Vitest（カバレッジレポート）
- ワークフローはバックエンド／フロントエンドをそれぞれ独立した job として並列実行
- 変更ファイルのパスフィルタにより、関連するファイルが変更された場合のみ各 job を実行

## Capabilities

### New Capabilities
- `ci-pipeline`: GitHub Actions による自動 lint/test CI パイプライン

### Modified Capabilities
<!-- なし -->

## Impact

- `.github/workflows/` ディレクトリを新規作成
- バックエンド: Python 3.12 環境で依存関係をインストールし ruff/pytest を実行
- フロントエンド: Node.js 環境で `npm ci` 後に lint/tsc/test を実行
- Docker や docker compose には依存しない（GHA の環境を直接使用）
