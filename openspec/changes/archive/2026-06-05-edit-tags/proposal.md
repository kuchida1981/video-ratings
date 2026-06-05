## Why

タグ管理画面でタグの追加・削除しかできず、作成後にラベルや点数を変更できない。スコア設計の見直しや誤入力の修正のたびにタグを削除して再作成する必要があり、操作コストが高い。

## What Changes

- タグ一覧の各タグに「編集」アクションを追加する
- インライン編集フォームでタグ名とスコアを変更できるようにする
- 保存時に既存の `PUT /tags/:id` エンドポイントへリクエストを送信する（バックエンド・APIクライアントは実装済み）

## Capabilities

### New Capabilities

なし（既存の tag-evaluation capability の拡張）

### Modified Capabilities

- `tag-evaluation`: タグの編集（名前・スコアの変更）要件を追加する

## Impact

- `frontend/src/pages/TagsPage.tsx`: 編集フォームの追加
- バックエンド・APIクライアントへの変更なし（`api.tags.update` は既存）
