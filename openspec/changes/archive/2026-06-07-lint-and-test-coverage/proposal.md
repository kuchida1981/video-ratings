## Why

開発者および AI エージェントがコードを変更した際に、品質上の問題（型エラー・スタイル違反・ロジックのバグ）をコミット前に即座に検出できる仕組みがない。lint とユニットテストのカバレッジチェックを整備することで、フィードバックループを短縮し、リグレッションを早期に防ぐ。

## What Changes

- **Backend**: ruff による lint/format チェックを導入
- **Backend**: pytest + pytest-cov によるユニットテスト基盤を整備。テスト対象は純粋ロジック（score_calculator, schemas）に限定し、DB 依存の routers は除外
- **Backend**: カバレッジ閾値を設定（services/ 95%、全体 80%）
- **Frontend**: ESLint（typescript-eslint + eslint-plugin-react-hooks）による lint チェックを導入
- **Frontend**: Vitest + @vitest/coverage-v8 によるユニットテスト基盤を整備。テスト対象は api/client.ts を中心とした純粋ロジック
- **Frontend**: カバレッジ閾値を設定（api/ 90%、全体 75%）
- **pre-commit**: `.pre-commit-config.yaml` を追加し、コミット時に ruff・eslint・tsc・pytest（unit マーク付きのみ）を自動実行

## Capabilities

### New Capabilities

- `backend-lint-test`: backend の ruff lint/format 設定、pytest ユニットテスト、カバレッジ閾値、および pre-commit フックの設定
- `frontend-lint-test`: frontend の ESLint 設定、Vitest ユニットテスト、カバレッジ閾値、および pre-commit フックの設定

### Modified Capabilities

（なし）

## Impact

- `backend/pyproject.toml`: ruff・pytest・pytest-cov の設定を追加
- `backend/app/services/`, `backend/app/schemas/`: 新規テストファイルを追加
- `frontend/package.json`: ESLint・Vitest 関連パッケージを devDependencies に追加
- `frontend/vite.config.ts` または `frontend/vitest.config.ts`: Vitest 設定を追加
- `frontend/src/api/`, `frontend/src/lib/`: 新規テストファイルを追加
- `.pre-commit-config.yaml`: 新規作成（リポジトリルートに配置）
- CI なし（GitHub Actions は別 change で対応）
