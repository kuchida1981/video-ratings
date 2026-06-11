## Purpose

TanStack Query を使った Performers データフェッチの仕様。useQuery / useMutation によるデータ取得・更新とキャッシュ無効化のパターンを定義する。

## Requirements

### Requirement: Performers 一覧を useQuery でフェッチする
PerformersPage は `useQuery` を使って performers 一覧を取得しなければならない（SHALL）。

#### Scenario: 初期表示時にデータがフェッチされる
- **WHEN** PerformersPage が表示される
- **THEN** performers 一覧がフェッチされ表示される

### Requirement: Performer の CRUD 操作を useMutation で実行する
Performer の作成・更新・削除・タグ追加削除・エイリアス操作・カバー画像操作はすべて `useMutation` を通じて実行し、成功後に performers キャッシュを無効化しなければならない（SHALL）。

#### Scenario: Performer 作成後に一覧が更新される
- **WHEN** ユーザーが新しい Performer を作成する
- **THEN** `['performers']` queryKey のキャッシュが無効化され、一覧が再フェッチされる

#### Scenario: Performer 詳細ページで更新後に詳細が更新される
- **WHEN** ユーザーが Performer の情報を更新する
- **THEN** `['performers', performerId]` キャッシュが無効化され、詳細が再フェッチされる
