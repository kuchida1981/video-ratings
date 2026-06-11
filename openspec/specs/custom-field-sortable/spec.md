# custom-field-sortable Specification

## Purpose
TBD - created by archiving change sortable-custom-fields. Update Purpose after archive.
## Requirements
### Requirement: is_sortable フラグの管理
Each CustomFieldDefinition MUST have an `is_sortable` flag (default `false`) indicating whether it can be used for sorting.
システムは各 CustomFieldDefinition に対して「並べ替えに使えるかどうか」を示す `is_sortable` フラグを持たなければならない。デフォルトは `false`。

#### Scenario: 新規作成時は is_sortable=false
- **WHEN** ユーザーが新しいカスタム項目定義を作成する
- **THEN** `is_sortable` は `false` として保存される

#### Scenario: is_sortable を true に更新できる
- **WHEN** ユーザーがカスタム項目設定ページのトグルをオンにする
- **THEN** システムは当該 CustomFieldDefinition の `is_sortable` を `true` に更新する

#### Scenario: is_sortable を false に戻せる
- **WHEN** ユーザーがカスタム項目設定ページのトグルをオフにする
- **THEN** システムは当該 CustomFieldDefinition の `is_sortable` を `false` に更新する

---

### Requirement: カスタム項目設定ページの is_sortable トグルUI
The settings page MUST display an `is_sortable` toggle for each custom field definition row, applicable to all field types (text/number/date/boolean).
カスタム項目設定ページの各定義行に、「並べ替えに使う」トグルを表示しなければならない。全てのフィールド型（text/number/date/boolean）でトグル可能。

#### Scenario: トグルの初期状態は is_sortable の値を反映する
- **WHEN** ユーザーがカスタム項目設定ページを開く
- **THEN** 各行のトグルは現在の `is_sortable` 値（true=ON / false=OFF）を表示する

#### Scenario: トグル操作で即時に更新される
- **WHEN** ユーザーがトグルをクリックする
- **THEN** システムは PUT リクエストを送信して `is_sortable` を更新し、UIも即座に反映する

