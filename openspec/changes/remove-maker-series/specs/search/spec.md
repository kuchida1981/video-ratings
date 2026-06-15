## MODIFIED Requirements

### Requirement: キーワード検索
The system MUST support keyword search across work title, performer name, and performer furigana.
システムは作品名・出演者名・出演者ふりがなに対してキーワード検索を実行できなければならない。

#### Scenario: 作品名でキーワード検索できる
- **WHEN** ユーザーが検索ボックスにキーワードを入力する
- **THEN** システムは作品名にそのキーワードを含む作品を返す

#### Scenario: 出演者名・ふりがなで検索できる
- **WHEN** ユーザーが出演者の名前またはふりがなでキーワードを入力する
- **THEN** システムはその出演者が紐づく作品を返す

---

### Requirement: 複合条件検索
The system MUST support combining keyword, tag, and custom field filters in a single search (AND logic).
システムはキーワード・タグ・カスタム項目のフィルタを組み合わせて検索できなければならない。

#### Scenario: 複数の条件を組み合わせて検索できる
- **WHEN** ユーザーがキーワードとタグを同時に指定して検索する
- **THEN** システムは全ての条件を満たす作品のみを返す（AND 結合）

#### Scenario: 条件をリセットできる
- **WHEN** ユーザーが「リセット」を実行する
- **THEN** システムは全フィルタを解除し、全件を表示する

---

### Requirement: performer_id による出演者フィルタリング
The works search API MUST accept a `performer_id` query parameter and return only works featuring that performer, combinable with other filters.
作品検索 API は `performer_id` クエリパラメータを受け付け、指定された出演者が出演している作品のみを返さなければならない。このパラメータは既存の keyword・tag フィルタと組み合わせられる。本パラメータは旧 `GET /performers/{id}/works` エンドポイントを代替する。

#### Scenario: performer_id を指定して出演作品のみを取得できる
- **WHEN** フロントエンドが `GET /works/search?performer_id=X` を呼ぶ
- **THEN** 出演者 X が出演している作品のみが返される

#### Scenario: performer_id が存在しない場合は 404 を返す
- **WHEN** 存在しない performer_id を指定して検索する
- **THEN** システムは HTTP 404 を返す

#### Scenario: performer_id と他のフィルタを組み合わせられる
- **WHEN** performer_id に加えて keyword や tag_ids も指定して検索する
- **THEN** すべての条件を AND で満たす作品のみが返される

## REMOVED Requirements

### Requirement: メーカー・シリーズによるフィルタリング
**Reason**: maker / series フィールドを作品データモデルから廃止するため。
**Migration**: maker / series フィルターパラメータは API から削除される。既存のクエリパラメータ `maker`・`series` は無視される（エラーにしない）。
