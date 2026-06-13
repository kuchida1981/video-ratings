## Why

画面上にアプリケーションのバージョンを表示する場所がなく、現在動作しているバージョン（Gitタグ）を即座に確認することができません。
本機能の導入により、デバッグ時やリリース後の動作確認時に、ユーザーや開発者がどのバージョンのコードが実行されているかを一目で把握できるようになります。

## What Changes

- **ビルド設定 of フロントエンド**: フロントエンドのビルド時（Vite）に、環境変数経由またはGitコマンド実行結果からバージョン情報を注入する仕組みを導入します。
- **サイドバー（フッター）の追加**: 画面左側のナビゲーションサイドバー底部に、バージョン番号を控えめに表示します。
- **設定画面の拡張**: 設定画面（Settings）の最下部に「アプリケーション情報」セクションを追加し、現在のバージョンを表示します。
- **CI/CD（GitHub Actions）の修正**: リリース用アーカイブを作成する際、Gitタグ名を環境変数 `VITE_APP_VERSION` に渡してフロントエンドをビルドするようにします。

## Capabilities

### New Capabilities
- `app-version-display`: アプリケーション全体のバージョン情報（Gitタグベース）を取得し、フッターと設定画面に表示する機能。

### Modified Capabilities
*なし*

## Impact

- **フロントエンドビルド設定** (`frontend/vite.config.ts`): ビルド時および開発時にバージョンを取得して `import.meta` に注入する処理の追加。
- **フロントエンド型定義** (`frontend/src/vite-env.d.ts`): `VITE_APP_VERSION` の型定義を追加。
- **レイアウトUI** (`frontend/src/App.tsx`): 左側サイドバーの底部にバージョン表示を追加。
- **設定UI** (`frontend/src/pages/SettingsPage.tsx`): 設定画面にバージョン情報を表示するエリアを追加。
- **リリースワークフロー** (`.github/workflows/release.yml`): `npm run build` 実行時に `VITE_APP_VERSION` 環境変数を注入。
