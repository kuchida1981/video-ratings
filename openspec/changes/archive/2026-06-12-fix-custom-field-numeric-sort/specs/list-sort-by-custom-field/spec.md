## MODIFIED Requirements

### Requirement: カスタム項目ソートの型別動作
Custom field sorting MUST use field_type-aware comparison logic; null/missing values MUST always be placed last (nulls last). Number-type field values MUST be stored as numeric types (not strings) in the database to ensure correct numeric ordering.
カスタム項目ソートは field_type に応じた比較ロジックで実行されなければならない。未入力値は常に末尾（nulls last）に置かれる。**数値型（number）フィールドの値はDBに数値型として保存されなければならない（文字列として保存された場合、辞書順ソートになり正しく動作しない）。**

#### Scenario: number 型はデフォルト降順でソートされる
- **WHEN** ユーザーが number 型カスタム項目のソートボタンを初回クリックする
- **THEN** 数値の大きい順（降順）でソートされ、未入力値は末尾になる（例: 15 → 14 → 9 → 未入力）

#### Scenario: date 型はデフォルト降順でソートされる
- **WHEN** ユーザーが date 型カスタム項目のソートボタンを初回クリックする
- **THEN** 日付の新しい順（降順）でソートされ、未入力値は末尾になる

#### Scenario: text 型はデフォルト昇順でソートされる
- **WHEN** ユーザーが text 型カスタム項目のソートボタンを初回クリックする
- **THEN** 文字列の昇順でソートされ、未入力値は末尾になる

#### Scenario: boolean 型はデフォルト降順でソートされる（true優先）
- **WHEN** ユーザーが boolean 型カスタム項目のソートボタンを初回クリックする
- **THEN** true の値が先頭に来る降順でソートされ、未入力値は末尾になる

## ADDED Requirements

### Requirement: 数値型カスタムフィールド値の型保証
The system SHALL store number-type custom field values as numeric types in the database JSONB column, not as strings. Both frontend and backend MUST coerce string input to numeric type before persisting.
数値型カスタムフィールドの値は、DBのJSONBカラムに文字列ではなく数値型として保存されなければならない。フロントエンドとバックエンドの両方が、文字列入力を数値型に変換してから保存しなければならない。

#### Scenario: number 型フィールドの値入力時に数値型で保存される
- **WHEN** ユーザーが number 型カスタムフィールドの入力欄に値を入力してフォーカスを外す
- **THEN** その値は数値型（整数または浮動小数点）としてAPIに送信され、DBに数値型で保存される

#### Scenario: number 型フィールドに空値を入力するとnullが保存される
- **WHEN** ユーザーが number 型カスタムフィールドの入力欄を空にしてフォーカスを外す
- **THEN** フィールドは null（未入力）として保存される（0ではなくnull）

#### Scenario: 既存の文字列型数値データはマイグレーションで修正される
- **WHEN** DBマイグレーションが実行される
- **THEN** works・performers テーブルの custom_fields JSONB内で、number 型定義に対応する文字列値がすべて数値型に変換される
