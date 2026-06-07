# frontend-lint-test

## Purpose

Frontend の静的解析・型チェック・テストカバレッジおよび pre-commit 自動チェックに関する仕様。ESLint による lint チェック、TypeScript 型チェック、API クライアントのユニットテスト、カバレッジ閾値の強制、および pre-commit フックによる自動検証を定義する。

## Requirements

### Requirement: ESLint チェック
frontend コードは ESLint ルール（typescript-eslint 推奨ルール + eslint-plugin-react-hooks）に適合していなければならない（SHALL）。`eslint src/` が 0 exit code で完了することが必要条件とする。

#### Scenario: lint エラーがある場合
- **WHEN** `eslint src/` を実行し、未使用変数や hooks 依存配列違反が存在する
- **THEN** コマンドが非 0 exit code で終了し、違反箇所を出力する

#### Scenario: lint エラーがない場合
- **WHEN** `eslint src/` を実行し、違反がない
- **THEN** コマンドが 0 exit code で終了する

### Requirement: TypeScript 型チェック
frontend コードは TypeScript 型エラーがない状態でなければならない（SHALL）。`tsc --noEmit` が 0 exit code で完了することが必要条件とする。

#### Scenario: 型エラーがある場合
- **WHEN** `tsc --noEmit` を実行し、型エラーが存在する
- **THEN** コマンドが非 0 exit code で終了し、エラー箇所を出力する

#### Scenario: 型エラーがない場合
- **WHEN** `tsc --noEmit` を実行し、型エラーがない
- **THEN** コマンドが 0 exit code で終了する

### Requirement: API クライアントのユニットテスト
`api/client.ts` の全 API メソッドはユニットテストで検証されなければならない（SHALL）。テストはグローバル `fetch` をモックし、実際のネットワーク通信を行わない。

#### Scenario: 成功レスポンスの場合に JSON を返す
- **WHEN** `fetch` が `200 OK` と JSON ボディを返すようにモックされ、`api.works.list()` を呼び出す
- **THEN** パースされた JSON オブジェクトが返される

#### Scenario: エラーレスポンスの場合に例外をスローする
- **WHEN** `fetch` が `404 Not Found` を返すようにモックされ、`api.works.get(999)` を呼び出す
- **THEN** `Error` がスローされ、メッセージにステータス情報が含まれる

#### Scenario: 204 No Content の場合に undefined を返す
- **WHEN** `fetch` が `204 No Content` を返すようにモックされ、`api.works.delete(1)` を呼び出す
- **THEN** `undefined` が返される（JSON パースを試みない）

#### Scenario: search メソッドがクエリパラメータを正しく組み立てる
- **WHEN** `api.works.search({ title: "test", tag_ids: [1, 2] })` を呼び出す
- **THEN** `fetch` が `/api/works/search?title=test&tag_ids=1&tag_ids=2` の形式の URL で呼ばれる

### Requirement: カバレッジ閾値の強制
`vitest run --coverage` 実行時、カバレッジが閾値を下回る場合はテストが失敗しなければならない（SHALL）。

- `src/api/`: 90% 以上
- 全体: 75% 以上
- `src/pages/`, `src/components/`, `src/ui/` は除外対象として設定する

#### Scenario: カバレッジが閾値を満たす場合
- **WHEN** `vitest run --coverage` を実行し、カバレッジが全閾値を満たす
- **THEN** コマンドが 0 exit code で終了する

#### Scenario: カバレッジが閾値を下回る場合
- **WHEN** テスト対象コードの一部がテストされておらず、カバレッジが閾値未満
- **THEN** `vitest run --coverage` が非 0 exit code で終了し、不足を報告する

### Requirement: pre-commit による自動チェック
`git commit` 実行時、ESLint・tsc の型チェックが自動実行されなければならない（SHALL）。いずれかが失敗した場合、コミットがブロックされる。

#### Scenario: ESLint エラーがある状態でコミット
- **WHEN** ESLint エラーを含むファイルをステージして `git commit` を実行する
- **THEN** pre-commit フックが失敗し、コミットがブロックされる

#### Scenario: 全チェックが通過した状態でコミット
- **WHEN** ESLint・tsc が全て通過する状態で `git commit` を実行する
- **THEN** コミットが正常に完了する
