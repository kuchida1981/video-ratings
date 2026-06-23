## Why

作品一覧テーブル表示でカスタムフィールドを編集するには、毎回作品詳細ページに遷移して編集し、一覧に戻る必要がある。複数作品を連続で編集する場面でページ遷移が繰り返し発生し、操作が煩わしい。テーブル表示にインライン編集モードを追加することで、一覧を離れずにカスタムフィールドを直接編集できるようにする。

## What Changes

- 作品一覧テーブル表示に「編集モード」トグルボタンを追加する
- 編集モードON時、カスタムフィールド列のセルがインライン入力欄（text / number / date → input、boolean → checkbox）に変わる
- セル単位の自動保存（blur 時に変更を検出し、変更があれば `PATCH /works/{id}/custom-fields` で保存）
- 保存失敗時のみエラーフィードバックを表示する（成功時はサイレント）
- 編集モードOFF時は現状と同じ読み取り専用表示に戻る
- タイトル・出演者・スコア・タグ・ファイル数・登録日は編集対象外とする

## Capabilities

### New Capabilities
- `inline-edit-mode`: 作品一覧テーブル表示のインライン編集モード。編集モードの切り替え、カスタムフィールドのインライン入力、セル単位の自動保存を扱う。

### Modified Capabilities
- `list-table-view`: テーブル表示に編集モードのトグルUIが追加され、編集モード中のセル操作が行クリックによる詳細ページ遷移と共存する必要がある。

## Impact

- `frontend/src/components/WorkTable.tsx`: 編集モード対応（セルをinputに変換、blur時の保存処理）
- `frontend/src/pages/WorksPage.tsx`: 編集モードの状態管理とトグルUIの追加
- バックエンド変更なし（既存の `PATCH /works/{id}/custom-fields` をそのまま利用）
