## Context

直近のコミットで ruff/pytest（backend）・ESLint/tsc/Vitest（frontend）の lint/test 基盤が整備された。pre-commit フックによるローカル実行は設定済みだが、GitHub 上の PR・push に対する自動 CI が存在しない。`.github/workflows/ci.yml` を追加してこのギャップを埋める。

backend の unit テスト（`-m unit` マーク）は DB 不要で独立して実行できることが確認済み。

## Goals / Non-Goals

**Goals:**
- push/PR トリガーで backend・frontend の lint/test を自動実行
- backend と frontend を独立した job として並列実行し CI 時間を短縮
- パスフィルタにより関係のない変更では該当 job をスキップ
- pytest のカバレッジレポートを CI 上で出力

**Non-Goals:**
- DB を使った integration テストの CI 実行（現状 unit テストのみ対象）
- デプロイや CD パイプラインの構築
- Docker image のビルドや push

## Decisions

### 1. Docker compose を使わず GHA ネイティブ環境で実行

**採用**: Python/Node の setup action を使いホスト上で直接実行  
**却下**: `docker compose up` でコンテナを起動してから実行する方式  
**理由**: pre-commit は docker compose 経由だが、CI では DB 接続が不要な unit テストのみを実行するためオーバーヘッドが不要。GHA ネイティブ実行の方がシンプルで高速かつキャッシュが効きやすい。

### 2. 単一ワークフローファイル、複数 job 構成

**採用**: `.github/workflows/ci.yml` に `backend` / `frontend` の 2 job を定義  
**却下**: ファイルを分ける（`backend-ci.yml` / `frontend-ci.yml`）  
**理由**: 管理箇所を 1 ファイルに集約しつつ、job レベルで並列実行・パスフィルタの独立性を確保できる。

### 3. パスフィルタで不要な job をスキップ

`paths` フィルタを使い、`backend/**` 変更時のみ backend job、`frontend/**` 変更時のみ frontend job を実行する。CI の無駄な消費を防ぐ。

### 4. pip / npm キャッシュを有効化

`actions/cache` または各 setup action のキャッシュオプションを利用し、依存関係インストール時間を短縮する。

## Risks / Trade-offs

- **[Risk] unit テストのみ実行**: integration テストは CI でカバーされない → 将来的に DB サービスコンテナを追加する際の拡張点として設計を開けておく
- **[Trade-off] ホスト実行とローカル環境の差異**: pre-commit は docker 内、CI はホスト直接実行のため環境差異が生じうる → pyproject.toml・package.json でバージョンを固定することで影響を最小化

## Migration Plan

1. `.github/workflows/` ディレクトリを作成
2. `ci.yml` を追加してコミット・push
3. GitHub Actions タブでワークフローが正常に起動することを確認
4. ロールバック: ワークフローファイルを削除すれば CI は無効化される（コードへの影響なし）
