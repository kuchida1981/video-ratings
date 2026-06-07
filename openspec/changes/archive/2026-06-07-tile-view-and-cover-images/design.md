## Context

現在の作品一覧・出演者一覧・出演者詳細ページは HTML table によるテキスト主体のレイアウト。カバー画像の概念はデータモデルに存在しない。`WorkFile` は作品のファイルパス管理用として存在するが、カバー画像用ではない。`Performer` にはファイル概念がない。

変更対象ファイル:
- `backend/app/models/models.py` — `Work`, `Performer` モデル
- `backend/app/schemas/work.py`, `performer.py` — レスポンス定義
- `backend/app/routers/works.py`, `performers.py` — エンドポイント追加
- `backend/app/main.py` — StaticFiles マウント
- `frontend/src/pages/WorksPage.tsx`, `PerformersPage.tsx`, `PerformerDetailPage.tsx`, `WorkDetailPage.tsx`, `SettingsPage.tsx`
- `frontend/src/components/ColumnConfigPopover.tsx`, `hooks/useColumnConfig.ts` — 削除

## Goals / Non-Goals

**Goals:**
- テーブル → タイルグリッドへの完全移行（ビュー切り替えなし）
- 作品・出演者への画像アップロード（ファイル + クリップボード）
- グリッド最大列数のグローバル設定（作品・出演者共通）
- ColumnConfigPopover / useColumnConfig の完全削除

**Non-Goals:**
- 外部URLからの画像自動取得
- 画像リサイズ・サムネイル生成（アップロードした画像をそのまま配信）
- テーブルビューとタイルビューの切り替え UI

## Decisions

### 1. カバー画像はファイルシステムに保存、専用カラムで参照

`works` / `performers` テーブルに `cover_image_path` (nullable String) を追加。実ファイルは `uploads/covers/{entity}/{id}{ext}` に保存し、FastAPI の `StaticFiles` で `/static/covers/` として配信。

**代替案**: DB blob → 大量の画像でパフォーマンス問題が発生する。`WorkFile` を再利用 → `Performer` に適用できない、カバー画像とファイルの意味論が異なる。

### 2. タイルグリッドの CSS アプローチ

最大列数 `maxCols` に対して、以下の CSS grid を使用:

```css
grid-template-columns: repeat(
  auto-fill,
  minmax(max(100px, calc(100% / maxCols - gap * (maxCols - 1) / maxCols)), 1fr)
);
```

これにより、フル幅では最大 `maxCols` 列、画面が狭くなると自動的に折り返す。`max(100px, ...)` はカード最小幅のフロアとして機能する。

インライン style で動的に生成する:
```tsx
const minWidth = `max(100px, calc(${(100 / maxCols).toFixed(4)}% - ${(12 * (maxCols - 1) / maxCols).toFixed(2)}px))`;
style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` }}
```

**代替案**: `repeat(maxCols, 1fr)` 固定 → 画面幅に関わらず固定列数になり、狭い画面でカードが潰れる。

### 3. 最大列数設定は localStorage に保存

`localStorage` キー `tileGridMaxColumns` に整数を保存。デフォルト 6。Settings ページで 2〜12 の範囲で変更可能。

**代替案**: DB に保存 → ユーザー管理機能が必要になり過剰。`SessionStorage` → ページを閉じると消えるため UX が悪い。

### 4. クリップボード貼り付けは paste イベントで実装

`CoverUploadZone` コンポーネントが `onFocus`/`onBlur` を管理し、アクティブ状態のときに `window` の `paste` イベントを購読。`ClipboardEvent.clipboardData.items` から `image/*` を抽出して File に変換しアップロード。

### 5. カバー画像 API: 単純な上書き方式

`POST /works/{id}/cover` で新しい画像を受け取った際、既存の画像ファイルがあれば削除して上書き。`DELETE /works/{id}/cover` で画像を削除。これにより「バージョン履歴」等の複雑さを排除する。

### 6. Alembic マイグレーション

`cover_image_path` カラムは nullable で追加（既存レコードへの影響なし）。

## Risks / Trade-offs

- **ファイル孤立リスク**: DB からレコードを直接削除した場合（バルクインポートのデータリセット等）、`uploads/covers/` のファイルが残る可能性。→ カスケード削除エンドポイントで対処。定期的なクリーンアップは今回の対象外。
- **画像サイズ制限なし**: リサイズを実装しないため大容量画像をそのまま保存・配信する。→ フロントエンドで `accept="image/*"` として、アップロード時のサイズ警告は実装しない（今回の対象外）。
- **ColumnConfigPopover 廃止**: テーブル表示がなくなるため `ColumnConfigPopover` と `useColumnConfig` を完全削除する。タイルには「表示する列の選択」概念がないため、カスタム項目・タグはタイルには表示しない。

## Migration Plan

1. Alembic マイグレーションを作成・適用 (`docker compose exec backend alembic upgrade head`)
2. `uploads/covers/` ディレクトリを作成（Docker volume またはホストマウント）
3. フロントエンドをビルド・デプロイ

ロールバック: `alembic downgrade -1` で `cover_image_path` カラムを削除。アップロード済み画像ファイルは手動削除が必要。

## Open Questions

- `uploads/covers/` の Docker ボリューム設定は既存の `docker-compose.yml` に追加が必要 → 実装フェーズで確認
