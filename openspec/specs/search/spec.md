# Search Spec

## Purpose

作品名・出演者名・メーカー・シリーズ・タグ・カスタム項目を組み合わせて作品を検索・フィルタリング・ソートする機能を提供する。
## Requirements
### Requirement: キーワード検索
The system MUST support keyword search across work title, maker, series, performer name, and performer furigana.
システムは作品名・メーカー・シリーズ・出演者名・出演者ふりがなに対してキーワード検索を実行できなければならない。

#### Scenario: 作品名でキーワード検索できる
- **WHEN** ユーザーが検索ボックスにキーワードを入力する
- **THEN** システムは作品名にそのキーワードを含む作品を返す

#### Scenario: 出演者名・ふりがなで検索できる
- **WHEN** ユーザーが出演者の名前またはふりがなでキーワードを入力する
- **THEN** システムはその出演者が紐づく作品を返す

#### Scenario: メーカー・シリーズで検索できる
- **WHEN** ユーザーがメーカー名またはシリーズ名でキーワードを入力する
- **THEN** システムはそのメーカー・シリーズに一致する作品を返す

---

### Requirement: タグによるフィルタリング
The system MUST allow filtering works by one or more tags (AND logic).
システムは1つまたは複数のタグを指定して作品を絞り込めなければならない。

#### Scenario: 単一タグで絞り込める
- **WHEN** ユーザーが1つのタグを選択してフィルタを適用する
- **THEN** システムはそのタグが付いた作品のみを返す

#### Scenario: 複数タグで AND 絞り込みできる
- **WHEN** ユーザーが複数のタグを選択してフィルタを適用する
- **THEN** システムは選択した全タグが付いている作品を返す

---

### Requirement: メーカー・シリーズによるフィルタリング
The system MUST support filtering works by maker or series.
システムはメーカーまたはシリーズを指定して作品を絞り込めなければならない。

#### Scenario: メーカーで絞り込める
- **WHEN** ユーザーがメーカーを選択してフィルタを適用する
- **THEN** システムはそのメーカーの作品のみを返す

#### Scenario: シリーズで絞り込める
- **WHEN** ユーザーがシリーズを選択してフィルタを適用する
- **THEN** システムはそのシリーズの作品のみを返す

---

### Requirement: 複合条件検索
The system MUST support combining keyword, tag, maker, series, and custom field filters in a single search (AND logic).
システムはキーワード・タグ・メーカー・シリーズ・カスタム項目のフィルタを組み合わせて検索できなければならない。

#### Scenario: 複数の条件を組み合わせて検索できる
- **WHEN** ユーザーがキーワードとタグとメーカーを同時に指定して検索する
- **THEN** システムは全ての条件を満たす作品のみを返す（AND 結合）

#### Scenario: 条件をリセットできる
- **WHEN** ユーザーが「リセット」を実行する
- **THEN** システムは全フィルタを解除し、全件を表示する

---

### Requirement: 検索結果のソート
The search API MUST support sorting results by fixed keys (`created_at`, `total_score`) as well as by custom field values using the `custom:<field_name>` prefix format.
システムは検索結果を複数の基準でソートできなければならない。`sort_by` パラメータには固定値（`created_at`, `total_score`）に加え、`custom:<フィールド名>` 形式でカスタム項目名を指定できる。

#### Scenario: 合計スコア順でソートできる
- **WHEN** ユーザーが「スコア順」を選択する
- **THEN** システムは合計スコアの高い順に作品を並べる

#### Scenario: 登録日順でソートできる
- **WHEN** ユーザーが「登録日順」を選択する
- **THEN** システムは登録日の新しい順に作品を並べる

#### Scenario: カスタム項目名を指定してソートできる
- **WHEN** フロントエンドが `sort_by=custom:発売日` のように `custom:` プレフィックス付きでリクエストする
- **THEN** システムは `custom_fields['発売日']` の値でソートして返す

#### Scenario: カスタム項目の未入力値は末尾になる
- **WHEN** `sort_by=custom:<name>` でソートし、一部の作品に該当フィールドの値がない
- **THEN** 値のない作品は sort_desc の値に関わらず末尾に配置される

#### Scenario: 存在しないカスタム項目名を指定した場合は全件末尾扱い
- **WHEN** `sort_by=custom:存在しない項目` でリクエストする
- **THEN** 全件が null 扱いとなり、登録日降順相当で返される（エラーにしない）

### Requirement: performer_id による出演者フィルタリング
The works search API MUST accept a `performer_id` query parameter and return only works featuring that performer, combinable with other filters.
作品検索 API は `performer_id` クエリパラメータを受け付け、指定された出演者が出演している作品のみを返さなければならない。このパラメータは既存の keyword・tag・maker・series フィルタと組み合わせられる。本パラメータは旧 `GET /performers/{id}/works` エンドポイントを代替する。

#### Scenario: performer_id を指定して出演作品のみを取得できる
- **WHEN** フロントエンドが `GET /works/search?performer_id=X` を呼ぶ
- **THEN** 出演者 X が出演している作品のみが返される

#### Scenario: performer_id が存在しない場合は 404 を返す
- **WHEN** 存在しない performer_id を指定して検索する
- **THEN** システムは HTTP 404 を返す

#### Scenario: performer_id と他のフィルタを組み合わせられる
- **WHEN** performer_id に加えて keyword や tag_ids も指定して検索する
- **THEN** すべての条件を AND で満たす作品のみが返される

