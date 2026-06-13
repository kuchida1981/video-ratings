## Context

本プロジェクトはモノレポであり、フロントエンド（React/Vite）とバックエンド（FastAPI）が一元管理されています。
バージョン情報は個別の設定ファイルに手動で書き込むのではなく、Gitのリリース用タグ（GitHub Releases）を正（Single Source of Truth）とします。
プロダクション用のビルドおよびリリースアーカイブ作成は、GitHub Actionsのワークフローを介して行われます。

## Goals / Non-Goals

**Goals:**
- Gitタグに基づくバージョン情報をビルド時にフロントエンドに埋め込む。
- ローカル開発時（`npm run dev`）にも自動的にGitの最新状態（直近のタグやコミットハッシュ）を反映して画面に表示する。
- 画面上のフッター（左側サイドバー底部）と設定画面（Settings）にバージョンを表示する。

**Non-Goals:**
- バックエンド側にバージョン情報を動的取得する専用APIエンドポイントの追加（今回はフロントエンドのビルド時注入だけで解決するため）。
- バージョン表示用の独立したデザインテーマや多言語化対応。

## Decisions

### Decision 1: Viteの `define` 機能と環境変数の利用
- **決定**: `vite.config.ts` で `define` を使用し、ビルド環境変数 `VITE_APP_VERSION` を `import.meta.env.VITE_APP_VERSION` にマッピングする。
- **代替案**: `package.json` を直接 React コードに import する。
- **選定理由**: `package.json` にはリリースタグの情報が直接書き込まれておらず（リリース時に毎回手動で書き換える必要がある）、ビルド時に外部からタグ情報を注入するのが困難であるため。Viteの `define` を使えば、ビルド環境（CI/CD）の情報を直接注入できます。

### Decision 2: 開発環境での Git コマンドの動的実行
- **決定**: `vite.config.ts` の中で `child_process.execSync('git describe --tags --always')` を実行し、動的にバージョンを生成する。
- **代替案**: 開発中は固定文字列（"development"）にする。
- **選定理由**: 開発者がどのコミットをベースに作業しているか、一目で把握できるようにするため。開発効率とデバッグのしやすさを向上させます。

### Decision 3: CI/CDでの注入
- **決定**: `.github/workflows/release.yml` 内のフロントエンドビルドステップで、環境変数 `VITE_APP_VERSION: ${{ github.ref_name }}` を設定する。
- **選定理由**: GitHub Actions の `release.yml` は Git タグのプッシュをトリガーに動くため、`${{ github.ref_name }}` がそのままタグ名（バージョン）となるため、最も確実かつシンプルに注入できます。

## Risks / Trade-offs

- **[Risk]**: 開発マシンの環境に `git` コマンドがインストールされていない、または Docker コンテナ内などで `.git` フォルダがない場合にビルドエラーになる。
- **[Mitigation]**: `execSync` を `try-catch` で囲み、エラー時は `'development'` にフォールバックします。
