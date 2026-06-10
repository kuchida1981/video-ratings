# performer-list-sort Specification

## Purpose
TBD - created by archiving change performer-list-sort. Update Purpose after archive.
## Requirements
### Requirement: 出演者一覧のソート
The system MUST support sorting the performer list by name, work count, or average work score.
システムは出演者一覧ページで、表示順を「名前順 / 作品数順 / 作品平均点数順」× 昇順/降順に切り替えられなければならない。

#### Scenario: ソートキーと方向を変更できる
- **WHEN** ユーザーがソートキーセレクトまたは昇順/降順トグルを操作する
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

#### Scenario: デフォルトソートは名前昇順
- **WHEN** ユーザーが出演者一覧ページを初めて開く
- **THEN** ソートキーは「名前順」、方向は「昇順」が初期選択されている

