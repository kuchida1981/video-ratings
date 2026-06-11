# filter-state-persistence Specification

## Purpose

作品一覧および出演者一覧のフィルタ・ソート条件を localStorage に永続化し、ページリロードや画面遷移後も条件を復元する機能の仕様。

## Requirements

### Requirement: フィルタ・ソート条件をlocalStorageに保存する
作品一覧および出演者一覧のフィルタ・ソート条件は、変更されるたびに localStorage に保存されなければならない（SHALL）。ストレージキーは `video-ratings:works-filters`（作品一覧）および `video-ratings:performers-filters`（出演者一覧）とする。

保存対象:
- 作品一覧: keyword, selectedTagIds, maker, series, sortBy, sortDesc, onlyUnrated, onlyNoCover, onlyNoFiles
- 出演者一覧: sortBy, sortDesc, onlyUnrated, onlyNoCover

#### Scenario: フィルタを変更すると自動保存される
- **WHEN** ユーザーが作品一覧または出演者一覧でフィルタ・ソートを変更する
- **THEN** 変更後の条件が即座に localStorage に保存される

#### Scenario: ページリロード後も条件が復元される
- **WHEN** ユーザーがフィルタ条件を設定した後にページをリロードする
- **THEN** リロード後も同じフィルタ・ソート条件が適用された状態で一覧が表示される

#### Scenario: 詳細ページから戻っても条件が維持される
- **WHEN** ユーザーがフィルタ条件を設定した状態で詳細ページへ遷移し、一覧へ戻る
- **THEN** 設定していたフィルタ・ソート条件が復元された状態で一覧が表示される

#### Scenario: ブラウザ再起動後も条件が復元される
- **WHEN** ユーザーがブラウザを閉じて再度開き、作品一覧または出演者一覧を開く
- **THEN** 前回設定していたフィルタ・ソート条件が復元される

### Requirement: フィルタ全解除ボタンを表示する
作品一覧および出演者一覧で、フィルタ・ソート条件のいずれかがデフォルト値から変更されている場合、「フィルタ全解除」ボタンを表示しなければならない（SHALL）。

デフォルト値:
- 作品一覧: keyword="", selectedTagIds=[], maker="", series="", sortBy="created_at", sortDesc=true, onlyUnrated=false, onlyNoCover=false, onlyNoFiles=false
- 出演者一覧: sortBy="name", sortDesc=false, onlyUnrated=false, onlyNoCover=false

#### Scenario: デフォルト値から変更されている場合にボタンが表示される
- **WHEN** 作品一覧または出演者一覧でフィルタ・ソートのいずれかがデフォルト値と異なる
- **THEN** フィルタ全解除ボタンが表示される

#### Scenario: 全条件がデフォルト値の場合にボタンは非表示
- **WHEN** 作品一覧または出演者一覧で全てのフィルタ・ソートがデフォルト値である
- **THEN** フィルタ全解除ボタンは表示されない

#### Scenario: フィルタ全解除ボタンをクリックすると全条件がリセットされる
- **WHEN** ユーザーがフィルタ全解除ボタンをクリックする
- **THEN** 全てのフィルタ・ソート条件がデフォルト値に戻り、localStorage の保存内容も削除される
