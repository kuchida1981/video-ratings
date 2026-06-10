## MODIFIED Requirements

### Requirement: 出演者一覧ページでタイル表示する
システムは出演者一覧ページで出演者をタイルグリッド形式で表示しなければならない。出演者タイルには名前・出演作品数・スコアを表示する。`GET /performers` レスポンスの各出演者オブジェクトには `avg_work_score`（出演作品の total_score 平均値）を含まなければならない。作品が0件の場合は `avg_work_score = 0.0` とする。

#### Scenario: 出演者タイルの内容
- **WHEN** ユーザーが出演者一覧ページを表示する
- **THEN** 各出演者がタイルとして表示され、名前・出演作品数・スコアがタイル内に含まれる

#### Scenario: 出演者が登録されていない場合
- **WHEN** 出演者が1件も登録されていない状態で出演者一覧ページを表示する
- **THEN** 「出演者が登録されていません」というメッセージを表示する

#### Scenario: avg_work_score が API レスポンスに含まれる
- **WHEN** クライアントが `GET /performers` を呼び出す
- **THEN** 各出演者オブジェクトに `avg_work_score` フィールド（float）が含まれる

#### Scenario: 作品が0件の出演者の avg_work_score
- **WHEN** 作品が紐づいていない出演者が `GET /performers` に含まれる
- **THEN** その出演者の `avg_work_score` は `0.0` である
