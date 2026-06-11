## ADDED Requirements

### Requirement: Works 一覧を useQuery でフェッチする
WorksPage は `useQuery` を使って works 一覧を取得しなければならない。フィルター・ソート条件が変化したとき、queryKey が変わり自動的に再フェッチされる。

#### Scenario: 初期表示時にデータがフェッチされる
- **WHEN** WorksPage が表示される
- **THEN** 現在のフィルター・ソート条件で works 一覧がフェッチされ表示される

#### Scenario: フィルター条件変更時に自動再フェッチされる
- **WHEN** ユーザーがキーワード・メーカー・シリーズ・タグ・ソート条件を変更する
- **THEN** 新しい条件で自動的に再フェッチが実行される（手動での fetchWorks 呼び出しは不要）

### Requirement: Work の CRUD 操作を useMutation で実行する
Work の作成・更新・削除・タグ追加削除・出演者追加削除・カバー画像操作はすべて `useMutation` を通じて実行し、成功後に works キャッシュを無効化しなければならない。

#### Scenario: Work 作成後に一覧が更新される
- **WHEN** ユーザーが新しい Work を作成する
- **THEN** `['works']` queryKey のキャッシュが無効化され、一覧が再フェッチされる

#### Scenario: Work 更新後に詳細が更新される
- **WHEN** ユーザーが Work の詳細情報を更新する
- **THEN** `['works', workId]` キャッシュが無効化され、詳細が再フェッチされる

#### Scenario: 手動での再フェッチ関数呼び出しが不要になる
- **WHEN** any CRUD ミューテーションが成功する
- **THEN** 明示的な reload() / fetchWorks() 呼び出しなしに画面が最新データを表示する
