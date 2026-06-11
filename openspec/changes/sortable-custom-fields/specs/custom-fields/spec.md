## MODIFIED Requirements

### Requirement: カスタム項目定義の管理
システムはユーザーが作品または出演者に追加できるカスタム項目を定義・削除できなければならない。定義は名前、型（text / number / date / boolean）、対象エンティティ（work / performer）、および並べ替え使用可否（`is_sortable`、デフォルト false）を持つ。名前のユニーク性は同一 entity_type の中でのみ保証される（異なる entity_type では同一名を使用できる）。

#### Scenario: 作品用のカスタム項目定義を作成できる
- **WHEN** ユーザーが名前・型・対象エンティティ（work）を指定してカスタム項目定義を作成する
- **THEN** システムは定義を保存し（is_sortable=false）、全作品の登録・編集フォームにそのフィールドが表示される

#### Scenario: 出演者用のカスタム項目定義を作成できる
- **WHEN** ユーザーが名前・型・対象エンティティ（performer）を指定してカスタム項目定義を作成する
- **THEN** システムは定義を保存し（is_sortable=false）、全出演者の詳細ページにそのフィールドが表示される

#### Scenario: 同じ名前を異なる entity_type で作成できる
- **WHEN** ユーザーが既存の作品用カスタム項目と同じ名前で出演者用カスタム項目定義を作成する
- **THEN** システムは定義を保存する（entity_type が異なるため重複ではない）

#### Scenario: 同じ entity_type 内で同名の項目は作成できない
- **WHEN** ユーザーが既存の作品用カスタム項目と同じ名前・同じ entity_type でカスタム項目定義を作成しようとする
- **THEN** システムはエラーを返し、定義を保存しない

#### Scenario: カスタム項目定義を削除できる
- **WHEN** ユーザーがカスタム項目定義を削除する
- **THEN** システムは定義を削除し、対応するエンティティ（works または performers）の custom_fields から対応するキーの値も削除する
