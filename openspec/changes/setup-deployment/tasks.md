## 1. リポジトリにファイル追加

- [x] 1.1 `scripts/install.sh` を作成する（システムユーザー作成・ディレクトリ作成・.env コピー＆編集プロンプト・DB 自動作成ロジック・venv 構築・alembic migrate・systemd/nginx インストール・サービス起動・video-ratings-update コピー）
- [x] 1.2 `scripts/update.sh` を作成する（バージョン引数 or GitHub API で latest 解決・アーカイブ DL・展開・venv 構築・alembic migrate・symlink 更新・systemctl restart・自己更新）
- [x] 1.3 `etc/video-ratings.service` を作成する（User=video-ratings・EnvironmentFile=/var/lib/video-ratings/.env・ExecStart で current/backend/.venv/bin/uvicorn 起動）
- [x] 1.4 `etc/nginx.conf` を作成する（/ → current/frontend/dist の静的配信・/api/ → 127.0.0.1:8000 プロキシ）

## 2. GitHub Actions リリースワークフロー

- [x] 2.1 `.github/workflows/release.yml` を作成する（トリガー: tags `v*`・ジョブ: Node.js セットアップ・npm run build・uv export --frozen --no-dev・tar.gz アーカイブ作成・gh release create でアタッチ）

## 3. ドキュメント

- [x] 3.1 `INSTALL.md` を作成する（事前要件・初回インストール手順・バージョン更新手順・ロールバック手順をコマンド例付きで記載）

## 4. 動作確認

- [ ] 4.1 テスト用タグを push して GitHub Actions が正常完了し、リリースアーカイブが生成されることを確認する
- [ ] 4.2 ローカルまたはテスト環境で `install.sh` を実行し、サービスが起動することを確認する
