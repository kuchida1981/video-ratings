## 1. カスタムフックの作成

- [x] 1.1 `frontend/src/hooks/useDocumentTitle.ts` ファイルを新規作成する
- [x] 1.2 カスタムフック `useDocumentTitle` を実装する。引数としてタイトル文字列（オプション）を受け取り、`useEffect` 内で `document.title` に設定する（`title` が渡されている場合は `${title} | Video Ratings`、空の場合は `"Video Ratings"` とする）

## 2. 各ページコンポーネントへの適用

- [x] 2.1 `WorksPage.tsx` で `useDocumentTitle("作品一覧")` を呼び出す
- [x] 2.2 `PerformersPage.tsx` で `useDocumentTitle("出演者一覧")` を呼び出す
- [x] 2.3 `TagsPage.tsx` で `useDocumentTitle("タグ管理")` を呼び出す
- [x] 2.4 `SettingsPage.tsx` で `useDocumentTitle("設定")` を呼び出す
- [x] 2.5 `WorkDetailPage.tsx` で `useDocumentTitle(work ? work.title : "作品詳細")` を呼び出す
- [x] 2.6 `PerformerDetailPage.tsx` で `useDocumentTitle(performer ? performer.name : "出演者詳細")` を呼び出す

## 3. 動作確認

- [x] 3.1 各画面に遷移した際、ブラウザのタブ名が意図通りに変更されることを確認する
- [x] 3.2 詳細画面（作品・出演者）にて、読み込み中は「作品詳細」「出演者詳細」と表示され、データの読み込み完了後に実際の作品名・出演者名にタイトルが切り替わることを確認する
