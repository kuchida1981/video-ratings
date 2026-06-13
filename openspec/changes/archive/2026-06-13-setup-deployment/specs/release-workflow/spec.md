## ADDED Requirements

### Requirement: タグ push でリリースアーカイブを自動生成する
システムは `v*` パターンのタグが push されたとき、GitHub Actions ワークフローを自動実行しなければならない（SHALL）。ワークフローはフロントエンドをビルドし、Python の依存関係一覧を生成し、リリースアーカイブを作成して GitHub Release にアタッチしなければならない（SHALL）。

#### Scenario: タグ push でワークフロー実行
- **WHEN** `v1.2.0` のようなセマンティックバージョンのタグを push する
- **THEN** GitHub Actions が起動し、フロントエンドをビルドし、`requirements.txt` を生成し、`video-ratings-v1.2.0.tar.gz` を GitHub Release に公開する

### Requirement: リリースアーカイブはサーバーで Node.js・uv なしに展開できる
リリースアーカイブは、ビルド済みフロントエンド静的ファイルと `requirements.txt` を含んでいなければならない（SHALL）。サーバー上で npm・node・uv を必要としない。

#### Scenario: アーカイブの内容確認
- **WHEN** リリースアーカイブを展開する
- **THEN** `backend/`、`frontend/dist/`、`requirements.txt`、`etc/`、`scripts/` が含まれている
