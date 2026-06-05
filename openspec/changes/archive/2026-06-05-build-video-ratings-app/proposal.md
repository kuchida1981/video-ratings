## Why

個人所有の映像ソフトをカタログ化・評価・検索するためのWebアプリケーションが存在しない。タグベースの柔軟なスコアリングシステムと出演者評価を組み合わせることで、自分の好みに合わせた評価軸でコレクションを管理できるようにする。

## What Changes

- 新規プロジェクトとして映像ソフト評価システムを構築する
- Docker Compose による開発・デプロイ環境を整備する
- 以下の機能を初版として実装する：
  - 作品の登録（個別・CSVインポート）
  - 出演者管理（名前・ふりがな）と出演者評価
  - タグカテゴリ・タグによる評価システム（スコアリング付き）
  - 作品・出演者・カスタム項目による検索・フィルタリング
  - カスタム項目の定義と管理

## Capabilities

### New Capabilities

- `work-management`: 作品の登録・編集・削除。個別登録とCSVインポート（title, performer_names, performer_furiganas, directory_path）。ファイルパス（SMB URL形式）の複数管理。
- `performer-management`: 出演者エンティティの管理（名前・ふりがな）。作品との多対多の関連付け、主演フラグ。
- `tag-evaluation`: タグカテゴリ（entity_type: work|performer、is_multi_select）とタグ（score: nullable）の管理。作品・出演者へのタグ付け。スコア計算（作品スコア + 主演出演者スコア）。
- `custom-fields`: ユーザー定義のカスタム項目（名前・型: text/number/date）。JSONB保存・GIN indexによる検索対応。
- `search`: キーワード検索（作品名・出演者名・ふりがな）、タグフィルタ、メーカー・シリーズフィルタ、カスタム項目フィルタ（型に応じた絞り込み）。

### Modified Capabilities

## Impact

- 新規プロジェクト。既存コードへの影響なし
- 依存関係: Python 3.12+, FastAPI, SQLAlchemy, PostgreSQL 16, React 18, TypeScript, Vite, shadcn/ui, Docker Compose
- Ubuntu 24.04 ローカルネットワーク環境にホスティング予定
