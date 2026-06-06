## 1. バックエンド: WorkListResponse の拡張

- [ ] 1.1 `backend/app/schemas/work.py` に `TagInWorkList` スキーマを追加（id, name, category_id）
- [ ] 1.2 `WorkListResponse` に `custom_fields: Optional[dict[str, Any]]` と `tags: list[TagInWorkList]` フィールドを追加
- [ ] 1.3 `backend/app/routers/search.py` の result ビルダーに `custom_fields` と `tags`（category_id 含む）を追加

## 2. フロントエンド: 型定義の更新

- [ ] 2.1 `frontend/src/types/index.ts` の `WorkListItem` に `custom_fields` と `tags`（id, name, category_id）を追加

## 3. フロントエンド: 列設定インフラの実装

- [ ] 3.1 `frontend/src/types/index.ts` または専用ファイルに `ColumnDef<T>` 型を定義（id, label, required, defaultVisible, width, align, render）
- [ ] 3.2 `frontend/src/hooks/useColumnConfig.ts` を新規作成（localStorage の読み書き・デフォルトフォールバック・不正 ID の除去）
- [ ] 3.3 `frontend/src/components/ColumnConfigPopover.tsx` を新規作成（Popover + グループ別チェックボックス・必須列 disabled）

## 4. フロントエンド: WorksPage の列定義と統合

- [ ] 4.1 `WorksPage.tsx` に works 用の固定列定義（出演者・作品名・メーカー・シリーズ・スコア・登録日）を実装
- [ ] 4.2 カスタム項目から動的列定義を生成する関数を実装
- [ ] 4.3 タグカテゴリから動的列定義を生成する関数を実装（カンマ区切りタグ名・なしは「—」）
- [ ] 4.4 `useColumnConfig("works", allColumns)` を組み込み、テーブルを `ColumnDef[]` ベースで描画するよう書き換え
- [ ] 4.5 `ColumnConfigPopover` をテーブル右上に配置
- [ ] 4.6 テーブルに `table-layout: fixed` を適用し、各列に設計通りの幅クラスを設定
- [ ] 4.7 全 td/th に `overflow-hidden text-ellipsis whitespace-nowrap` を適用し、`title` 属性でフルテキストを設定

## 5. フロントエンド: PerformersPage の列定義と統合

- [ ] 5.1 `PerformersPage.tsx` に performers 用の固定列定義（名前・ふりがな・出演作数・スコア）を実装
- [ ] 5.2 カスタム項目から動的列定義を生成する関数を実装（entity_type=performer）
- [ ] 5.3 タグカテゴリから動的列定義を生成する関数を実装（entity_type=performer）
- [ ] 5.4 `useColumnConfig("performers", allColumns)` を組み込み、テーブルを `ColumnDef[]` ベースで描画するよう書き換え
- [ ] 5.5 `ColumnConfigPopover` をテーブル右上に配置
- [ ] 5.6 テーブルに `table-layout: fixed` を適用し、各列に設計通りの幅クラスを設定
- [ ] 5.7 全 td/th に `overflow-hidden text-ellipsis whitespace-nowrap` を適用し、`title` 属性でフルテキストを設定

## 6. 動作確認

- [ ] 6.1 作品一覧で列の表示/非表示を切り替えて設定がページ再読み込み後も保持されることを確認（ユーザーに依頼）
- [ ] 6.2 カスタム項目列・タグカテゴリ列を追加して正しい値が表示されることを確認（ユーザーに依頼）
- [ ] 6.3 出演者一覧で同様の動作確認（ユーザーに依頼）
- [ ] 6.4 多数の列を選択しても横スクロールが発生せずテキストが省略されることを確認（ユーザーに依頼）
