## MODIFIED Requirements

### Requirement: 出演者一覧のソート
The system MUST support sorting the performer list by name, work count, average work score, or any performer custom field with `is_sortable=true`.
システムは出演者一覧ページで、表示順を「名前順 / 作品数順 / 作品平均点数順 / is_sortable=true の出演者用カスタム項目」× 昇順/降順に切り替えられなければならない。

#### Scenario: ソートキーと方向を変更できる
- **WHEN** ユーザーがソートボタンを操作する
- **THEN** システムはページ内の出演者タイルを即座に再並び替えして表示する

#### Scenario: 名前順ソート（昇順）
- **WHEN** ユーザーが「名前順」「昇順」を選択する
- **THEN** 出演者タイルはふりがな（未登録の場合は名前）の昇順で並ぶ

#### Scenario: 名前順ソート（降順）
- **WHEN** ユーザーが「名前順」「降順」を選択する
- **THEN** 出演者タイルはふりがな（未登録の場合は名前）の降順で並ぶ

#### Scenario: 作品数順ソート（降順）
- **WHEN** ユーザーが「作品数順」「降順」を選択する
- **THEN** 出演者タイルは work_count の多い順に並ぶ

#### Scenario: 作品数順ソート（昇順）
- **WHEN** ユーザーが「作品数順」「昇順」を選択する
- **THEN** 出演者タイルは work_count の少ない順に並ぶ

#### Scenario: 作品平均点数順ソート（降順）
- **WHEN** ユーザーが「作品平均点数順」「降順」を選択する
- **THEN** 出演者タイルは avg_work_score の高い順に並ぶ

#### Scenario: 作品平均点数順ソート（昇順）
- **WHEN** ユーザーが「作品平均点数順」「昇順」を選択する
- **THEN** 出演者タイルは avg_work_score の低い順に並ぶ

#### Scenario: カスタム項目ソート（降順）
- **WHEN** ユーザーが is_sortable=true の出演者用カスタム項目のソートボタンをクリックする（初回またはアクティブでない状態）
- **THEN** 出演者タイルはそのカスタム項目の値で型に応じたデフォルト方向にソートされ、未入力値は末尾になる

#### Scenario: localStorage に保存値がない場合のデフォルトソートは名前昇順
- **WHEN** ユーザーが出演者一覧ページを初めて開く、または localStorage に保存値が存在しない
- **THEN** ソートキーは「名前順」、方向は「昇順」が初期選択されている
