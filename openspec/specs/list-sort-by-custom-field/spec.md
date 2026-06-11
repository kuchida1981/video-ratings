# list-sort-by-custom-field Specification

## Purpose
TBD - created by archiving change sortable-custom-fields. Update Purpose after archive.
## Requirements
### Requirement: 作品一覧でカスタム項目ソートボタンを表示する
The works list page MUST dynamically display sort buttons for work custom fields with `is_sortable=true`, alongside the existing sort buttons.
作品一覧ページ（WorksPage）は `is_sortable=true` の作品用カスタム項目を、既存のソートボタン（スコア順・登録日順）の隣に動的に表示しなければならない。

#### Scenario: is_sortable=true の作品用項目がソートボタンとして表示される
- **WHEN** ユーザーが作品一覧ページを開き、is_sortable=true の作品用カスタム項目が存在する
- **THEN** 既存の「スコア順」「登録日順」に加え、当該カスタム項目名のソートボタンが表示される

#### Scenario: is_sortable=false の項目はソートボタンに表示されない
- **WHEN** ユーザーが作品一覧ページを開き、is_sortable=false のカスタム項目のみが存在する
- **THEN** カスタム項目のソートボタンは表示されない

#### Scenario: カスタム項目ソートボタンをクリックすると並べ替えられる
- **WHEN** ユーザーが作品一覧のカスタム項目ソートボタンをクリックする
- **THEN** 作品一覧がそのカスタム項目の値でソートされ（デフォルト: 型に応じた方向）、ボタンがアクティブ状態になる

#### Scenario: 既にアクティブなカスタム項目ボタンを再クリックすると方向が反転する
- **WHEN** ユーザーがアクティブなカスタム項目ソートボタンを再クリックする
- **THEN** ソート方向（昇順/降順）が反転する

---

### Requirement: 出演者一覧でカスタム項目ソートボタンを表示する
The performers list page MUST dynamically display sort buttons for performer custom fields with `is_sortable=true`, alongside the existing sort buttons.
出演者一覧ページ（PerformersPage）は `is_sortable=true` の出演者用カスタム項目を、既存のソートボタンの隣に動的に表示しなければならない。

#### Scenario: is_sortable=true の出演者用項目がソートボタンとして表示される
- **WHEN** ユーザーが出演者一覧ページを開き、is_sortable=true の出演者用カスタム項目が存在する
- **THEN** 当該カスタム項目名のソートボタンが既存ボタンの隣に表示される

#### Scenario: 出演者一覧のカスタム項目ソートはクライアントサイドで実行される
- **WHEN** ユーザーが出演者一覧のカスタム項目ソートボタンをクリックする
- **THEN** フロントエンドが performer.custom_fields の値でクライアントソートし、即座に再並べ替えされる

---

### Requirement: 出演者詳細ページの作品一覧でカスタム項目ソートを提供する
The performer detail page MUST provide a sort UI (by score, registration date, and sortable custom fields) for the works list section.
出演者詳細ページの作品一覧（PerformerDetailPage）に、作品用ソートUI（登録日順・スコア順・カスタム項目）を追加しなければならない。

#### Scenario: 出演者詳細ページの作品一覧に登録日順・スコア順のソートボタンが追加される
- **WHEN** ユーザーが出演者詳細ページを開く
- **THEN** 作品一覧セクションに「スコア順」「登録日順」のソートボタンが表示される（デフォルト: 登録日降順）

#### Scenario: 出演者詳細ページの作品一覧で is_sortable=true の作品用項目がソートボタンとして表示される
- **WHEN** ユーザーが出演者詳細ページを開き、is_sortable=true の作品用カスタム項目が存在する
- **THEN** 作品一覧セクションにそのカスタム項目名のソートボタンも表示される

---

### Requirement: カスタム項目ソートの型別動作
Custom field sorting MUST use field_type-aware comparison logic; null/missing values MUST always be placed last (nulls last).
カスタム項目ソートは field_type に応じた比較ロジックで実行されなければならない。未入力値は常に末尾（nulls last）に置かれる。

#### Scenario: number 型はデフォルト降順でソートされる
- **WHEN** ユーザーが number 型カスタム項目のソートボタンを初回クリックする
- **THEN** 数値の大きい順（降順）でソートされ、未入力値は末尾になる

#### Scenario: date 型はデフォルト降順でソートされる
- **WHEN** ユーザーが date 型カスタム項目のソートボタンを初回クリックする
- **THEN** 日付の新しい順（降順）でソートされ、未入力値は末尾になる

#### Scenario: text 型はデフォルト昇順でソートされる
- **WHEN** ユーザーが text 型カスタム項目のソートボタンを初回クリックする
- **THEN** 文字列の昇順でソートされ、未入力値は末尾になる

#### Scenario: boolean 型はデフォルト降順でソートされる（true優先）
- **WHEN** ユーザーが boolean 型カスタム項目のソートボタンを初回クリックする
- **THEN** true の値が先頭に来る降順でソートされ、未入力値は末尾になる

---

### Requirement: カスタム項目ソート状態の保持
The works list and performers list MUST persist their sort state (including custom field sort keys) in localStorage so it is restored on subsequent visits.
作品一覧・出演者一覧のソート状態（カスタム項目含む）は localStorage に保持されなければならない。出演者詳細ページの作品ソート状態は保持不要。

#### Scenario: ページ再訪時にカスタム項目ソート状態が復元される
- **WHEN** ユーザーがカスタム項目でソートした後にページを離脱・再訪する
- **THEN** 作品一覧・出演者一覧のソート状態（custom:<name> と sortDesc）が復元される

#### Scenario: 削除されたカスタム項目のソート状態はデフォルトにフォールバックする
- **WHEN** localStorage に `custom:発売日` のソート状態が残っているが、そのカスタム項目が削除されている
- **THEN** 対応するソートボタンが存在しないため、デフォルトソート（登録日降順 or 名前昇順）が使用される

