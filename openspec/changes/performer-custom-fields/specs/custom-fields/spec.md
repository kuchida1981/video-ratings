## MODIFIED Requirements

### Requirement: カスタム項目定義の管理
システムはユーザーが作品または出演者に追加できるカスタム項目を定義・削除できなければならない。定義は名前、型（text / number / date / boolean）、および対象エンティティ（work / performer）を持つ。

#### Scenario: 作品用のカスタム項目定義を作成できる
- **WHEN** ユーザーが名前・型・対象エンティティ（work）を指定してカスタム項目定義を作成する
- **THEN** システムは定義を保存し、全作品の登録・編集フォームにそのフィールドが表示される

#### Scenario: 出演者用のカスタム項目定義を作成できる
- **WHEN** ユーザーが名前・型・対象エンティティ（performer）を指定してカスタム項目定義を作成する
- **THEN** システムは定義を保存し、全出演者の詳細ページにそのフィールドが表示される

#### Scenario: カスタム項目定義を削除できる
- **WHEN** ユーザーがカスタム項目定義を削除する
- **THEN** システムは定義を削除し、対応するエンティティ（works または performers）の custom_fields から対応するキーの値も削除する

---

## ADDED Requirements

### Requirement: boolean 型のカスタム項目値の設定
システムは boolean 型のカスタム項目について、チェックボックスで true/false を設定できなければならない。

#### Scenario: boolean 型のカスタム項目を true に設定できる
- **WHEN** ユーザーが boolean 型の項目のチェックボックスをオンにする
- **THEN** システムはその値を JSON の `true` として custom_fields に保存する

#### Scenario: boolean 型のカスタム項目を false に設定できる
- **WHEN** ユーザーが boolean 型の項目のチェックボックスをオフにする
- **THEN** システムはその値を JSON の `false` として custom_fields に保存する

---

### Requirement: 出演者のカスタム項目値の設定
システムは出演者詳細ページで、出演者用カスタム項目定義に対して値を設定できなければならない。値は必須でない。

#### Scenario: 出演者の text 型カスタム項目に値を設定できる
- **WHEN** ユーザーが出演者詳細ページで text 型の項目に文字列を入力して保存する
- **THEN** システムはその値を performers.custom_fields の該当キーに保存する

#### Scenario: 出演者の number 型カスタム項目に値を設定できる
- **WHEN** ユーザーが出演者詳細ページで number 型の項目に数値を入力して保存する
- **THEN** システムはその値を数値として保存する

#### Scenario: 出演者の date 型カスタム項目に値を設定できる
- **WHEN** ユーザーが出演者詳細ページで date 型の項目に日付を入力して保存する
- **THEN** システムはその値を ISO 8601 形式の文字列として保存する

#### Scenario: 出演者のカスタム項目の値を空にできる
- **WHEN** ユーザーが出演者のカスタム項目の値を削除して保存する
- **THEN** システムは performers.custom_fields から該当キーを削除する
