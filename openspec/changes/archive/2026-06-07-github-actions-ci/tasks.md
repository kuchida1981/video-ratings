## 1. ワークフローファイルの作成

- [x] 1.1 `.github/workflows/` ディレクトリを作成する
- [x] 1.2 `.github/workflows/ci.yml` を作成し、push/PR トリガーと `backend`・`frontend` の 2 job を定義する

## 2. バックエンド CI ジョブの実装

- [x] 2.1 `backend/**` のパスフィルタを設定し、関係ない変更でジョブをスキップするようにする
- [x] 2.2 Python 3.12 の setup と pip キャッシュ（`pyproject.toml` をキーに）を設定する
- [x] 2.3 `pip install -e ".[dev]"` で依存関係をインストールするステップを追加する
- [x] 2.4 `ruff check app/` を実行するステップを追加する
- [x] 2.5 `ruff format --check app/` を実行するステップを追加する
- [x] 2.6 `pytest -m unit --cov --cov-report=term-missing` を実行するステップを追加する

## 3. フロントエンド CI ジョブの実装

- [x] 3.1 `frontend/**` のパスフィルタを設定し、関係ない変更でジョブをスキップするようにする
- [x] 3.2 Node.js（LTS）の setup と npm キャッシュ（`package-lock.json` をキーに）を設定する
- [x] 3.3 `npm ci` で依存関係をインストールするステップを追加する
- [x] 3.4 `npm run lint` を実行するステップを追加する
- [x] 3.5 `npx tsc --noEmit` を実行するステップを追加する
- [x] 3.6 `npm test` を実行するステップを追加する

## 4. 動作確認

- [x] 4.1 ワークフローファイルを push し、GitHub Actions タブで両ジョブが正常に起動・成功することを確認する
- [x] 4.2 backend のみ変更した PR で frontend job がスキップされることを確認する
- [x] 4.3 frontend のみ変更した PR で backend job がスキップされることを確認する
