## 1. ビルド設定と型定義の修正

- [ ] 1.1 `frontend/vite.config.ts` にて `VITE_APP_VERSION` を `define` に設定し、ローカル環境用の `git describe --tags --always` 実行処理とフォールバック処理を実装する
- [ ] 1.2 `frontend/src/vite-env.d.ts` にて `VITE_APP_VERSION` の型定義を追加する

## 2. CI/CDワークフローの修正

- [ ] 2.1 `.github/workflows/release.yml` の `Build frontend` ステップで、ビルド環境変数 `VITE_APP_VERSION` に `${{ github.ref_name }}` を渡すように修正する

## 3. UI表示の実装

- [ ] 3.1 `frontend/src/App.tsx` の左側ナビゲーションサイドバーの底部にバージョン表示用のフッターエリアを追加する
- [ ] 3.2 `frontend/src/pages/SettingsPage.tsx` の最下部に「アプリケーション情報」セクションを追加し、バージョン番号を表示する
