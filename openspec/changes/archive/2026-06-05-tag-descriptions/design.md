## Context

現状の `tag_categories` テーブルおよび `tags` テーブルには説明フィールドが存在しない。タグ管理画面 (`TagsPage.tsx`) ではカテゴリがデフォルト閉じた状態で表示されており、作品・出演者のタグ編集ダイアログにはホバー表示の仕組みもない。

## Goals / Non-Goals

**Goals:**
- `description` カラムをDBに追加（additive migration）
- タグ管理画面の作成・編集フォームに説明入力欄を追加
- タグ管理画面のデフォルト展開化
- 作品・出演者のタグ編集ダイアログへのカテゴリ説明表示とタグツールチップの追加

**Non-Goals:**
- `TagInWork` / `TagSummary` など、タグの参照型への description の追加（編集ダイアログのみで使用）
- スコア計算ロジックへの影響
- 説明の文字数制限や入力バリデーション

## Decisions

### DBマイグレーション: additive only
`tag_categories.description` と `tags.description` をそれぞれ `TEXT NULL` で追加する。既存データは NULL のまま有効。マイグレーション番号は `002`。

### タグ編集ダイアログの description 取得
作品・出演者のタグ編集ダイアログでは、現在タグカテゴリ一覧をAPIから取得している。このレスポンスに `description` を含めるだけで対応できる。タグ側の description は「タグ一覧に含まれるタグオブジェクト」にフィールドを追加することで取得する。専用エンドポイントの追加は不要。

### カテゴリ説明の表示場所
タグ編集ダイアログのカテゴリセクションヘッダー横に、説明があれば薄いサブテキストとして表示する。アイコン+ツールチップではなく常時表示とする（短いヒントを想定しているため）。

### タグツールチップ
ネイティブの `title` 属性を使わず、Tailwind の `group/tooltip` パターンまたは既存 UI コンポーネントに準じた方法でツールチップを実装する。description が null または空文字の場合はツールチップなし。

### デフォルト展開
`TagsPage` の `reload()` 完了後に、取得した全カテゴリの ID を `expanded` ステートの初期値として設定する。ユーザーが折りたたんだ後は手動操作が維持される（ページリロードで再展開）。

## Risks / Trade-offs

- [タグ編集ダイアログへの description 伝搬] TagCategory の API レスポンスに description を追加するため、既存のフロント型定義 (`TagCategory`) を変更する必要がある。タグ一覧表示などで不要な description が payload に含まれるが、影響は軽微。→ 許容する。

## Migration Plan

1. Alembic マイグレーション 002 を適用（`alembic upgrade head`）
2. バックエンドを再起動（スキーマ変更のみ、データ移行不要）
3. フロントエンドをビルド・デプロイ
4. ロールバック: マイグレーション 002 の downgrade で description カラムを削除

## Open Questions

なし
