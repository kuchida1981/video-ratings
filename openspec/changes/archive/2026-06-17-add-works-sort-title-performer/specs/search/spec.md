## MODIFIED Requirements

### Requirement: 検索結果のソート
The search API MUST support sorting results by fixed keys (`created_at`, `total_score`, `title`, `performer_furigana`) as well as by custom field values using the `custom:<field_name>` prefix format.
システムは検索結果を複数の基準でソートできなければならない。`sort_by` パラメータには固定値（`created_at`, `total_score`, `title`, `performer_furigana`）に加え、`custom:<フィールド名>` 形式でカスタム項目名を指定できる。

#### Scenario: 合計スコア順でソートできる
- **WHEN** ユーザーが「スコア順」を選択する
- **THEN** システムは合計スコアの高い順に作品を並べる

#### Scenario: 登録日順でソートできる
- **WHEN** ユーザーが「登録日順」を選択する
- **THEN** システムは登録日の新しい順に作品を並べる

#### Scenario: タイトル順でソートできる
- **WHEN** `sort_by=title` が指定される
- **THEN** システムは `Work.title` の Unicode 順（大文字小文字無視）で作品を並べる

#### Scenario: 出演者ふりがな順でソートできる
- **WHEN** `sort_by=performer_furigana` が指定される
- **THEN** システムはメイン出演者（is_main=True）の furigana 順で作品を並べ、furigana が存在しない作品をソート方向に関わらず末尾に置く
