## 1. Backend: ruff 設定

- [ ] 1.1 `backend/pyproject.toml` に `[tool.ruff]` セクションを追加（line-length, select ルール, ignore 設定）
- [ ] 1.2 `backend/pyproject.toml` に `[tool.ruff.format]` セクションを追加
- [ ] 1.3 `ruff check app/` と `ruff format --check app/` が 0 exit code で通ることを確認

## 2. Backend: pytest + pytest-cov 設定

- [ ] 2.1 `backend/pyproject.toml` に `pytest`, `pytest-cov` を dev dependencies として追加
- [ ] 2.2 `backend/pyproject.toml` に `[tool.pytest.ini_options]` セクションを追加（`markers = ["unit", "integration"]`, `testpaths = ["tests"]`）
- [ ] 2.3 `backend/pyproject.toml` に `[tool.coverage.run]` セクションを追加（`omit = ["app/routers/*", "app/main.py", "app/database.py", "app/config.py"]`）
- [ ] 2.4 `backend/pyproject.toml` に `[tool.coverage.report]` セクションを追加（全体閾値 80%、`app/services/` 閾値 95% の設定）

## 3. Backend: ユニットテスト実装

- [ ] 3.1 `backend/tests/__init__.py` を作成
- [ ] 3.2 `backend/tests/services/__init__.py` を作成
- [ ] 3.3 `backend/tests/services/test_score_calculator.py` を作成（`@pytest.mark.unit` 付き）
  - タグスコアのみの作品スコア計算
  - メインパフォーマーのスコアが加算される
  - メインパフォーマーなしの場合はパフォーマースコアが 0
  - スコアが None のタグは 0 として計算される
- [ ] 3.4 `backend/tests/schemas/__init__.py` を作成
- [ ] 3.5 `backend/tests/schemas/test_schemas.py` を作成（主要 Pydantic モデルのバリデーションテスト、`@pytest.mark.unit` 付き）
- [ ] 3.6 `pytest -m unit --cov=app` を実行し、カバレッジ閾値（services/ 95%・全体 80%）が通ることを確認

## 4. Frontend: ESLint 設定

- [ ] 4.1 必要パッケージを `frontend/package.json` の devDependencies に追加（`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`）
- [ ] 4.2 `frontend/eslint.config.js` を作成（flat config 形式、typescript-eslint 推奨ルール + react-hooks ルール）
- [ ] 4.3 `frontend/package.json` の `scripts` に `"lint": "eslint src/"` を追加
- [ ] 4.4 `npm run lint` が 0 exit code で通ることを確認（既存コードの違反があれば修正）

## 5. Frontend: Vitest + カバレッジ設定

- [ ] 5.1 必要パッケージを `frontend/package.json` の devDependencies に追加（`vitest`, `@vitest/coverage-v8`）
- [ ] 5.2 `frontend/vite.config.ts` に `test` セクションを追加（environment, coverage の設定、`src/pages/**`, `src/components/**`, `src/ui/**` を exclude）
- [ ] 5.3 カバレッジ閾値を設定（`src/api/` 90%・全体 75%）
- [ ] 5.4 `frontend/package.json` の `scripts` に `"test": "vitest run"`, `"test:coverage": "vitest run --coverage"` を追加

## 6. Frontend: ユニットテスト実装

- [ ] 6.1 `frontend/src/api/client.test.ts` を作成
  - `vi.stubGlobal('fetch', ...)` で fetch をモック
  - 成功レスポンス（200）で JSON を返すテスト
  - エラーレスポンス（404）で Error をスローするテスト
  - 204 No Content で undefined を返すテスト
  - `api.works.search` がクエリパラメータを正しく組み立てるテスト
- [ ] 6.2 `npm run test:coverage` を実行し、カバレッジ閾値（api/ 90%・全体 75%）が通ることを確認

## 7. pre-commit 設定

- [ ] 7.1 `pip install pre-commit` が必要な旨を README または TESTING.md に記載
- [ ] 7.2 `.pre-commit-config.yaml` をリポジトリルートに作成
  - `ruff check` フック（backend/）
  - `ruff format --check` フック（backend/）
  - `eslint src/` フック（frontend/、node 環境を使用）
  - `tsc --noEmit` フック（frontend/）
  - `pytest -m unit --no-cov` フック（backend/、高速実行）
- [ ] 7.3 `pre-commit install` を実行してフックをインストール
- [ ] 7.4 ダミーのコミットでフックが正常動作することを確認
