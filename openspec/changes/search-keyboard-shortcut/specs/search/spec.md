# Delta Spec: search (search-keyboard-shortcut)

## Added Requirements

### Requirement: キーボードショートカットで検索フォームにフォーカスできる

The system MUST focus the search input when the user presses "/" while not already typing in a form field.
ユーザーがフォーム要素以外にフォーカスがある状態で "/" キーを押すと、検索フォームにフォーカスが移らなければならない。

#### Scenario: "/" キーで検索フォームにフォーカスが移る
- **GIVEN** 作品一覧ページが表示されている
- **AND** フォーカスが input / textarea / contenteditable 以外にある
- **WHEN** ユーザーが "/" キーを押す
- **THEN** 検索フォームにフォーカスが移る
- **AND** "/" の文字は入力されない

#### Scenario: 入力中は "/" ショートカットが無効になる
- **GIVEN** 作品一覧ページが表示されている
- **AND** ユーザーが input または textarea にフォーカスしている
- **WHEN** ユーザーが "/" キーを押す
- **THEN** 通常の文字入力として処理される（ショートカットは発火しない）
