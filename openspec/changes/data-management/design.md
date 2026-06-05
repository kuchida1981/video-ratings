## Context

現状、登録データ全体のバックアップ・復元手段がない。サイドバーには「インポート」メニュー（`/import` → `ImportPage`）が独立ページとして存在し、作品のCSV一括登録に使われているが、今後「全データエクスポート/インポート」が設定画面に追加されると「インポート」という語が2つの異なる機能を指してしまう。設定ページ（`/settings`）は現在 `CustomFieldsPage` をそのままレンダリングしている。

## Goals / Non-Goals

**Goals:**
- 全データのエクスポート（JSON + スキーマバージョン）とインポート（完全置換）を設定画面に追加
- 設定画面を「カスタム項目」「データ管理」の2セクション構成に整理
- 作品CSV一括登録を作品ページ内の「一括登録」ボタン/モーダルに移動

**Non-Goals:**
- インポートの差分マージ（完全置換のみ）
- 旧スキーマバージョンからの自動マイグレーション
- エクスポートファイルの暗号化・圧縮

## Decisions

### エクスポート形式: JSON（全テーブルフラット）
SQLダンプはPostgreSQL依存で移植性が低い。CSVは多テーブル構造の表現が難しい。JSONは構造が自明でありブラウザから直接ダウンロード可能。`schema_version` フィールドにAlembicの最新リビジョン文字列（`"001"` 等）を含める。

```json
{
  "schema_version": "001",
  "exported_at": "2026-06-05T00:00:00Z",
  "data": {
    "tag_categories": [...],
    "tags": [...],
    "works": [...],
    "performers": [...],
    "work_performers": [...],
    "work_files": [...],
    "work_tags": [...],
    "performer_tags": [...],
    "custom_field_definitions": [...]
  }
}
```

### インポート: 完全置換（全削除 → 再挿入）
差分マージはIDの衝突解決が複雑になる。バックアップからの復元・環境移行が主目的なので完全置換で十分。削除と再挿入は単一トランザクション内で実行し、失敗時はロールバックする。外部キー制約の順序を考慮した削除順序（work_tags → work_performers → work_files → works など）で処理する。

### schema_version 検証
インポート時に `schema_version` がDBの現在のAlembicリビジョンと一致しない場合は `400 Bad Request` を返す。自動マイグレーションは行わない。

### 作品一括登録UI: モーダル化
`ImportPage` のロジック（プレビュー・実行）をそのままDialogコンポーネントに移植する。`WorksPage` に「一括登録」ボタンを追加し、クリックでモーダルを開く。`ImportPage` コンポーネントは残すが `/import` ルートとサイドバーナビを削除する（段階的に `ImportPage` も統合 or 削除可）。

### 設定ページ: SettingsPage 新設
`CustomFieldsPage` の内容をそのまま `SettingsPage` の「カスタム項目」セクションとして包含する。`CustomFieldsPage.tsx` は `SettingsPage.tsx` に統合し削除する。

## Risks / Trade-offs

- [大量データのインポート] 数万件のデータをトランザクション内で処理すると時間がかかる可能性。→ 個人利用規模では問題なし。将来的にはバックグラウンドジョブ化を検討。
- [IDの再利用] 完全置換後は同じIDが再利用されるためURLブックマークは維持される。→ 意図通り。
- [エクスポートデータのサイズ] 大量の `work_files` があると大きなJSONになりうる。→ 個人利用規模では許容。

## Migration Plan

1. バックエンドに `data.py` ルーターを追加し `main.py` に登録
2. フロントエンドの `App.tsx` を更新（ルート・サイドバー変更）
3. `SettingsPage.tsx` を新規作成
4. `WorksPage.tsx` に一括登録ボタン・モーダルを追加
5. ロールバック: 各変更は独立しており、ファイル単位で元に戻せる

## Open Questions

なし
