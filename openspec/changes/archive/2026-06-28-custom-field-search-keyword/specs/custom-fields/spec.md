## MODIFIED Requirements

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
