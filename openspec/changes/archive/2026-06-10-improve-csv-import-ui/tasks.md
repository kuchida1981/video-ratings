## 1. 状態管理の刷新

- [x] 1.1 `phase: 'upload' | 'preview' | 'confirm' | 'result'` state を追加し、既存の `preview / result` null チェックをフェーズ判定に置き換える
- [x] 1.2 `selectedRows: Set<number>` state を追加する
- [x] 1.3 プレビュー取得成功時に `is_valid === true` の全 `row_number` で `selectedRows` を初期化する

## 2. プレビューテーブルのレイアウト改修

- [x] 2.1 テーブルヘッダーを3列（チェックボックス・タイトル・出演者）に変更する
- [x] 2.2 各行を2段構成にする: 1段目にタイトル・出演者、2段目に `colSpan=2` でパスとエラーを表示する
- [x] 2.3 エラー行（`is_valid === false`）を薄いグレー背景でスタイリングする

## 3. 行選択 UI の実装

- [x] 3.1 各行の1段目にチェックボックスを追加する（valid 行: `selectedRows` と連動、error 行: `disabled`）
- [x] 3.2 ヘッダー行に「全選択」「全解除」ボタンを追加し、valid 行の `selectedRows` を一括操作できるようにする
- [x] 3.3 「確認へ →」ボタンを追加し、`selectedRows.size > 0` のときのみ活性化する

## 4. 確認画面の実装

- [x] 4.1 `phase === 'confirm'` 時に確認画面を描画する（`selectedRows` に含まれる行のみ表示、2段行レイアウト）
- [x] 4.2 確認画面でも行チェックボックスを操作して `selectedRows` から除外できるようにする
- [x] 4.3 「← 戻る」ボタン（`phase` を `preview` に戻す。`selectedRows` は維持）を実装する
- [x] 4.4 「インポート実行」ボタンを実装する（`selectedRows` でフィルタした行を `execute()` に渡す）

## 5. execute 関数の修正

- [x] 5.1 `execute()` が `selectedRows` に含まれる行のみを API に送信するよう変更する（`is_valid` フィルタを `selectedRows` フィルタに置き換える）

## 6. 動作確認

- [ ] 6.1 valid 行・error 行が混在する CSV でプレビューを表示し、レイアウト（折り返しなし）を確認する
- [ ] 6.2 行の選択・解除、全選択・全解除が正しく動作することを確認する
- [ ] 6.3 確認画面への遷移・戻る操作・チェック外しが正しく動作することを確認する
- [ ] 6.4 「インポート実行」後に選択行のみが登録されることを確認する
