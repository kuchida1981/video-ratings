# Custom Fields Spec

## Purpose

作品または出演者に対してユーザー定義のカスタム項目（text / number / date / boolean 型）を追加・管理するための機能を提供する。
## Requirements
### Requirement: カスタム項目定義の管理
The system MUST allow users to create and delete custom field definitions for works or performers; each definition MUST include a name, field type, target entity type, `is_sortable` flag (default false), and `is_search_keyword` flag (default false). `is_search_keyword` SHALL only be enabled for `field_type === "text"` definitions; the setting UI MUST disable the toggle for other types.
システムはユーザーが作品または出演者に追加できるカスタム項目を定義・削除できなければならない。定義は名前、型（text / number / date / boolean）、対象エンティティ（work / performer）、並べ替え使用可否（`is_sortable`、デフォルト false）、および検索キーワード使用可否（`is_search_keyword`、デフォルト false）を持つ。`is_search_keyword` は `field_type === "text"` のみ有効化できる。名前のユニーク性は同一 entity_type の中でのみ保証される。

#### Scenario: 作品用のカスタム項目定義を作成できる
- **WHEN** ユーザーが名前・型・対象エンティティ（work）を指定してカスタム項目定義を作成する
- **THEN** システムは定義を保存し（is_sortable=false, is_search_keyword=false）、全作品の登録・編集フォームにそのフィールドが表示される

#### Scenario: 出演者用のカスタム項目定義を作成できる
- **WHEN** ユーザーが名前・型・対象エンティティ（performer）を指定してカスタム項目定義を作成する
- **THEN** システムは定義を保存し（is_sortable=false, is_search_keyword=false）、全出演者の詳細ページにそのフィールドが表示される

#### Scenario: 同じ名前を異なる entity_type で作成できる
- **WHEN** ユーザーが既存の作品用カスタム項目と同じ名前で出演者用カスタム項目定義を作成する
- **THEN** システムは定義を保存する（entity_type が異なるため重複ではない）

#### Scenario: 同じ entity_type 内で同名の項目は作成できない
- **WHEN** ユーザーが既存の作品用カスタム項目と同じ名前・同じ entity_type でカスタム項目定義を作成しようとする
- **THEN** システムはエラーを返し、定義を保存しない

#### Scenario: カスタム項目定義を削除できる
- **WHEN** ユーザーがカスタム項目定義を削除する
- **THEN** システムは定義を削除し、対応するエンティティ（works または performers）の custom_fields から対応するキーの値も削除する

#### Scenario: text 型の is_search_keyword を有効化できる
- **WHEN** ユーザーがカスタム項目設定ページで text 型のカスタム項目の「検索に使う」スイッチをオンにする
- **THEN** システムはその定義の is_search_keyword を true に更新して保存する

#### Scenario: text 型以外では is_search_keyword トグルが無効化される
- **WHEN** ユーザーがカスタム項目設定ページで number / date / boolean 型のカスタム項目を表示する
- **THEN** 「検索に使う」スイッチは無効化（disabled）されており操作できない

#### Scenario: is_search_keyword を false に戻せる
- **WHEN** ユーザーがカスタム項目設定ページで is_search_keyword = true の text 型カスタム項目の「検索に使う」スイッチをオフにする
- **THEN** システムはその定義の is_search_keyword を false に更新して保存する

### Requirement: boolean 型のカスタム項目値の設定
The system MUST allow setting boolean custom field values via a checkbox (true/false).
システムは boolean 型のカスタム項目について、チェックボックスで true/false を設定できなければならない。

#### Scenario: boolean 型のカスタム項目を true に設定できる
- **WHEN** ユーザーが boolean 型の項目のチェックボックスをオンにする
- **THEN** システムはその値を JSON の `true` として custom_fields に保存する

#### Scenario: boolean 型のカスタム項目を false に設定できる
- **WHEN** ユーザーが boolean 型の項目のチェックボックスをオフにする
- **THEN** システムはその値を JSON の `false` として custom_fields に保存する

---

### Requirement: 作品へのカスタム項目値の設定
The system MUST allow setting custom field values for works during registration or editing; values are optional.
システムは作品登録・編集時に定義済みカスタム項目の値を設定できなければならない。値は必須でない。

#### Scenario: text 型のカスタム項目に値を設定できる
- **WHEN** ユーザーが text 型の項目に文字列を入力して保存する
- **THEN** システムはその値を works.custom_fields の該当キーに保存する

#### Scenario: number 型のカスタム項目に値を設定できる
- **WHEN** ユーザーが number 型の項目に数値を入力して保存する
- **THEN** システムはその値を数値として保存する

#### Scenario: date 型のカスタム項目に値を設定できる
- **WHEN** ユーザーが date 型の項目に日付を入力して保存する
- **THEN** システムはその値を ISO 8601 形式の文字列として保存する

#### Scenario: カスタム項目の値を空にできる
- **WHEN** ユーザーがカスタム項目の値を削除して保存する
- **THEN** システムは custom_fields から該当キーを削除する

---

### Requirement: 出演者のカスタム項目値の設定
The system MUST allow setting performer custom field values on the performer detail page and work detail page performer cards; values are optional.
システムは出演者詳細ページおよび作品詳細ページの出演者カードで、出演者用カスタム項目定義に対して値を設定できなければならない。値は必須でない。

#### Scenario: 出演者の text 型カスタム項目に値を設定できる
- **WHEN** ユーザーが出演者詳細ページまたは作品詳細ページの出演者カードで text 型の項目に文字列を入力して保存する
- **THEN** システムはその値を performers.custom_fields の該当キーに保存する

#### Scenario: 出演者の number 型カスタム項目に値を設定できる
- **WHEN** ユーザーが出演者詳細ページまたは作品詳細ページの出演者カードで number 型の項目に数値を入力して保存する
- **THEN** システムはその値を数値として保存する

#### Scenario: 出演者の date 型カスタム項目に値を設定できる
- **WHEN** ユーザーが出演者詳細ページまたは作品詳細ページの出演者カードで date 型の項目に日付を入力して保存する
- **THEN** システムはその値を ISO 8601 形式の文字列として保存する

#### Scenario: 出演者のカスタム項目の値を空にできる
- **WHEN** ユーザーが出演者詳細ページまたは作品詳細ページの出演者カードでカスタム項目の値を削除して保存する
- **THEN** システムは performers.custom_fields から該当キーを削除する

---

### Requirement: カスタム項目による検索
The system MUST support filtering works by custom field values with type-appropriate filters (keyword match for text, range for number/date).
システムはカスタム項目の値で作品を検索・フィルタリングできなければならない。型に応じたフィルタを提供する。

#### Scenario: text 型でキーワード一致検索できる
- **WHEN** ユーザーが text 型のカスタム項目に対してキーワードを入力して検索する
- **THEN** システムはそのキーワードを含む値を持つ作品を返す

#### Scenario: number 型で範囲検索できる
- **WHEN** ユーザーが number 型のカスタム項目に対して最小値・最大値を指定して検索する
- **THEN** システムはその範囲に含まれる値を持つ作品を返す

#### Scenario: date 型で範囲検索できる
- **WHEN** ユーザーが date 型のカスタム項目に対して開始日・終了日を指定して検索する
- **THEN** システムはその期間内の値を持つ作品を返す

---

### Requirement: 作品詳細ページの出演者カードにカスタム項目を表示する
The system MUST display a custom fields section in each performer card on the work detail page when performer custom field definitions exist.
システムは作品詳細ページの各出演者カードに、出演者用カスタム項目定義が存在する場合にカスタム項目セクションを表示しなければならない。

#### Scenario: 出演者用カスタム項目が存在する場合にセクションが表示される
- **WHEN** ユーザーが作品詳細ページを表示し、出演者用カスタム項目定義が1件以上登録されている
- **THEN** システムは各出演者カード内にカスタム項目セクションを表示し、各項目に現在保存されている値（または空）を表示する

#### Scenario: 出演者用カスタム項目が存在しない場合はセクションが表示されない
- **WHEN** ユーザーが作品詳細ページを表示し、出演者用カスタム項目定義が0件の場合
- **THEN** システムは各出演者カード内にカスタム項目セクションを表示しない

#### Scenario: 作品詳細ページで出演者カスタム項目の boolean 値を編集できる
- **WHEN** ユーザーが作品詳細ページの出演者カードで boolean 型のカスタム項目のチェックボックスを変更する
- **THEN** システムは即座に値を保存し、performers.custom_fields を更新する

#### Scenario: 作品詳細ページで出演者カスタム項目のテキスト系値を編集できる
- **WHEN** ユーザーが作品詳細ページの出演者カードで text / number / date 型のカスタム項目を入力してフォーカスを外す
- **THEN** システムは値を保存し、performers.custom_fields を更新する

