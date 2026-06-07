## Context

現在 backend・frontend ともに lint ツールおよびテストインフラが存在しない。`tsc -b` が build 時に型チェックを行うのみで、スタイル違反・ロジックバグ・カバレッジ不足をコミット前に検出する手段がない。AI エージェントを含む開発者が変更を加えた際のフィードバックループが長い。

既存コードの特性:
- `score_calculator.py`: 純粋関数、DB 非依存 → ユニットテストが容易
- `routers/*.py`: SQLAlchemy の DB セッションに直接依存 → UT でのモックコストが高く、今回は除外
- `api/client.ts`: `fetch` を薄くラップした純粋な HTTP クライアント → `fetch` をモックすれば高カバレッジを達成可能

## Goals / Non-Goals

**Goals:**
- backend に ruff lint/format と pytest ユニットテスト（カバレッジ付き）を導入
- frontend に ESLint と Vitest ユニットテスト（カバレッジ付き）を導入
- コミット時に pre-commit フックで両方のチェックを自動実行
- UT 対象コードのカバレッジ閾値を強制（backend services/ 95%・全体 80%、frontend api/ 90%・全体 75%）

**Non-Goals:**
- `routers/*.py` のユニットテスト（DB 依存、統合テストとして別 change で対応）
- GitHub Actions / CI 連携（別 change で対応）
- E2E テスト
- `pages/`, `components/` の UI テスト（後回し）

## Decisions

### 1. Backend lint: ruff 一択
ruff は flake8 + isort + black を統合した高速ツール。`pyproject.toml` に設定を集約でき、追加パッケージが最小限。`[tool.ruff]` セクションで line-length・select ルールセットを定義し、`[tool.ruff.format]` で format も同一ツールで管理する。

### 2. Backend テスト: pytest + pytest-cov、routers は omit
`pytest-cov` で `--cov=app` を実行し、`pyproject.toml` の `[tool.coverage.run]` で `omit = ["app/routers/*", "app/main.py", "app/database.py", "alembic/*"]` を指定。純粋ロジックのみをカバレッジ対象とすることで閾値の形骸化を防ぐ。

pytest マーカー `@pytest.mark.unit` を付与し、pre-commit では `pytest -m unit` のみ実行。統合テストは `pytest -m integration` で分離（将来用）。

### 3. Frontend lint: ESLint + typescript-eslint + react-hooks
Biome はツール統一の魅力があるが `eslint-plugin-react-hooks` の `exhaustive-deps` ルールに相当するものがまだ弱い。この React コードベースでは hooks 依存配列のバグ検出が重要なため ESLint を選択。

設定ファイルは `eslint.config.js`（flat config 形式）を採用。`tsconfig.json` と連携した型チェックつき lint を有効化。

### 4. Frontend テスト: Vitest + @vitest/coverage-v8
Vite プロジェクトのため `vite.config.ts` を共有できる Vitest が最適。`@alias` の自動解決、ESM の扱いが Jest より設定不要。coverage は V8 の built-in を使う `@vitest/coverage-v8` を選択（istanbul より設定が少ない）。

`api/client.ts` のテストでは `vi.stubGlobal('fetch', ...)` でグローバル fetch をモック。

### 5. pre-commit: Python の `pre-commit` フレームワークで統一
backend（ruff）と frontend（eslint, tsc）を `.pre-commit-config.yaml` 1ファイルで管理。`local` フックとして定義することで、node_modules や venv のセットアップ済み環境を使用。pytest は `pytest -m unit --no-cov` で高速実行（coverage 計算はコミット時に省略）。

## Risks / Trade-offs

- **カバレッジ閾値の厳格化 → 新機能追加が詰まるリスク**: `routers/` を除外することで緩和。ただし将来 routers にビジネスロジックが増えた場合は再評価が必要。
- **pre-commit の pytest がコミットを遅くする**: unit マーカーのテストのみ実行し、DB 不要・軽量なテストに限定することで緩和。
- **ESLint flat config はまだ移行期**: 一部プラグインが flat config 未対応の場合あり。`@eslint/compat` の `fixupPluginRules` で対応可能。
