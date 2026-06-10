## 1. バックエンド: スキーマ変更 (schemas/imports.py)

- [ ] 1.1 `PerformerMatch` モデルを追加する (`name`, `furigana`, `existing_id`, `existing_name`, `existing_aliases`)
- [ ] 1.2 `ImportRow.performer_names` / `performer_furiganas` を `performers: list[PerformerMatch]` に置き換える
- [ ] 1.3 `ImportRow` に `is_duplicate_suspect: bool = False` と `duplicate_hint: str | None = None` を追加する
- [ ] 1.4 `PerformerExecuteInfo` モデルを追加する (`name`, `furigana`, `performer_id: int | None`)
- [ ] 1.5 `ExecuteRow` モデルを追加する (`row_number`, `title`, `performers: list[PerformerExecuteInfo]`, `directory_path`)
- [ ] 1.6 `ImportExecuteRequest.rows` の型を `list[ImportRow]` から `list[ExecuteRow]` に変更する

## 2. バックエンド: preview エンドポイントの改修 (routers/imports.py)

- [ ] 2.1 `_parse_csv` 関数の戻り値から performer_names/performer_furiganas を除き、raw データとして返すよう調整する
- [ ] 2.2 `preview_import` に `db: Session = Depends(get_db)` を追加する
- [ ] 2.3 出演者照合ロジックを実装する: `performers.name` → `performer_aliases.name` の順で完全一致検索し `PerformerMatch` を生成する
- [ ] 2.4 重複作品検出ロジックを実装する: 同タイトルの既存作品を取得し、解決済み performer_id セットと比較する
- [ ] 2.5 重複疑いがある場合に `is_duplicate_suspect=True` と `duplicate_hint` を設定する

## 3. バックエンド: execute エンドポイントの改修 (routers/imports.py)

- [ ] 3.1 `execute_import` の受け取る型を `ImportExecuteRequest`（内部が `ExecuteRow` のリスト）に対応させる
- [ ] 3.2 `performer_id` が指定されている場合は既存出演者に紐づける、`None` の場合は新規作成するよう実装する
- [ ] 3.3 バリデーション済み行のみ送られてくる前提でスキップロジックを削除する

## 4. フロントエンド: 型定義の更新 (types/index.ts)

- [ ] 4.1 `PerformerMatch` 型を追加する
- [ ] 4.2 `ImportRow` 型を更新する (`performers: PerformerMatch[]`, `is_duplicate_suspect`, `duplicate_hint`)
- [ ] 4.3 `PerformerExecuteInfo` 型を追加する
- [ ] 4.4 `ExecuteRow` 型を追加する

## 5. フロントエンド: プレビューUIの改修 (pages/ImportPage.tsx)

- [ ] 5.1 行ごとの状態型 (`RowState`) を定義する: `skipped: boolean`, `performerOverrides: Record<string, boolean>`
- [ ] 5.2 preview 受信後に `RowState[]` を初期化する（重複疑い行は `skipped: true`、それ以外は `false`）
- [ ] 5.3 プレビューテーブルに「取り込む/スキップ」チェックボックス列を追加する
- [ ] 5.4 出演者列に既存マッチ情報を表示する（「メイン名 (alias1, alias2)」形式）
- [ ] 5.5 マッチした出演者に「別人として扱う」トグルを表示し、`performerOverrides` を更新する
- [ ] 5.6 重複疑いのある行に警告アイコンとヒントテキストを表示する
- [ ] 5.7 インポートボタンのラベルを「スキップしない行数」に連動させる
- [ ] 5.8 `execute` 送信時に `RowState` から `ExecuteRow[]` を構築する（`forceNew` ならば `performer_id: null`）
