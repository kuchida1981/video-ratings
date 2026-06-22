## 1. WorkTable コンポーネントの編集モード対応

- [ ] 1.1 `WorkTable` の props に `editMode: boolean` と `onUpdateCustomField: (workId: number, fieldName: string, value: unknown) => Promise<void>` を追加する
- [ ] 1.2 編集モードON時にカスタムフィールドセルを型に応じた入力UI（text→input[text], number→input[number], date→input[date], boolean→checkbox）に切り替えるロジックを実装する
- [ ] 1.3 各セルの初期値を保持し、blur（boolean は change）時に変更を検出して `onUpdateCustomField` を呼び出す保存処理を実装する
- [ ] 1.4 値を空にした場合は null として送信する処理を実装する
- [ ] 1.5 保存失敗時にセル枠を赤くハイライトし、値を編集前にロールバックするエラーハンドリングを実装する

## 2. WorksPage の編集モード状態管理とトグルUI

- [ ] 2.1 `WorksPage` に `editMode` state を追加し、テーブル表示時に編集モードトグルボタンを表示する（タイル表示時は非表示）
- [ ] 2.2 カスタムフィールド列が1つも表示されていない場合はトグルボタンを disabled にする
- [ ] 2.3 `editMode` と `onUpdateCustomField` ハンドラ（`api.works.updateCustomFields` を呼ぶ）を `WorkTable` に渡す
- [ ] 2.4 編集モードOFF時にワークリストを再取得して最新状態と同期する処理を追加する
