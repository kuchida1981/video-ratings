## Context

現在、WorksPage と PerformersPage はタイルグリッド表示のみをサポートする。各ページはフィルタ・ソートの状態を useState で管理し、localStorage に永続化するパターンを持つ。カスタム項目定義は API から取得し、ソート可能フィールドとして利用している。この変更では、これらのページにテーブル表示モードを追加する。バックエンド API のレスポンス構造（WorkListItem / Performer 型）は変更不要。

## Goals / Non-Goals

**Goals:**
- WorksPage・PerformersPage にタイル/テーブル切り替えトグルを追加する
- テーブル表示用コンポーネント WorkTable / PerformerTable を新規作成する
- テーブルの表示列をユーザーが選択でき、選択を localStorage に永続化する
- テーブルヘッダークリックで既存の sortBy/sortDesc state を操作しソートを切り替える

**Non-Goals:**
- 出演者詳細ページの出演作品一覧（タイル表示のまま）
- バックエンド API の変更
- テーブル表示でのページング（現在も全件取得のため不要）

## Decisions

### 1. WorkTable・PerformerTable を独立したコンポーネントとして作成する

WorkTile / PerformerTile はカバー画像を前提としたレイアウトを持つため、同コンポーネント内に分岐を追加するより別コンポーネントとした方が責務が明確になる。ページコンポーネントは `viewMode === "table"` の場合に WorkTable を、それ以外は既存のタイルグリッドをレンダリングする。

### 2. 表示モード（viewMode）は useState で管理し、localStorage には保存しない

ユーザーの基本操作はタイル表示が前提。テーブル表示は一時的な確認用途を想定し、ページ遷移・リロードでタイルに戻る仕様とする。これにより state 管理が単純になる。

### 3. 表示列設定は列キーの配列として localStorage に永続化する

作品: `video-ratings:works-table-columns`  
出演者: `video-ratings:performers-table-columns`

値はカラムキーの文字列配列（例: `["maker", "total_score", "custom:品番"]`）。カスタム項目のキーは既存のソートキー規則（`custom:<fieldName>`）に合わせる。最小列（タイトル・出演者名など）はキーに含まず、常に表示する。

デフォルト表示列:
- 作品: `["maker", "total_score"]`
- 出演者: `["work_count", "avg_work_score"]`

### 4. テーブルのソートは既存の sortBy/sortDesc state を共有する

フィルタパネルのソートボタンと同じ state を操作することでロジックの重複を避ける。テーブルヘッダーのクリックは「同じキーなら昇降順反転、別キーなら新しいキーで降順スタート」という既存パターンを踏襲する。ソート不可列（タイトル、出演者名、タグなど）はヘッダーにアイコンを表示せず、クリックを無効にする。

### 5. 列選択UIはフィルタパネル内にバッジ形式で表示し、テーブル表示時のみ表示する

既存の「未評価のみ」「カバー画像なし」などのバッジトグルと視覚的に統一する。テーブル表示時のみ列選択セクションを表示することで、タイル表示時にUIが増えることを避ける。

## Risks / Trade-offs

- カスタム項目が増えると列選択のバッジが多くなりフィルタパネルが縦に長くなる → 将来的に Popover への切り替えを検討できるが、現在のカスタム項目数では問題なし
- boolean 型カスタム項目のテーブル表示: ✓ / — で表示する（tile-grid-view では未表示のため新規検討不要）
- date 型カスタム項目: YYYY-MM-DD 形式でそのまま表示する

## Open Questions

なし（すべての設計判断は上記 Decisions で解決済み）
