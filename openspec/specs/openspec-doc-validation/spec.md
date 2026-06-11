# openspec-doc-validation Specification

## Purpose

pre-commit hook および GitHub Actions CI で `openspec validate --strict --all` を自動実行し、openspec ドキュメントの品質基準違反をコミット時・PR時に検出してブロックする。

## Requirements

### Requirement: pre-commit での openspec バリデーション
`openspec/` 配下のファイルが変更されたコミット時に、システムは `openspec validate --strict --all` を自動実行し、バリデーションエラーがある場合はコミットをブロックしなければならない（SHALL）。

#### Scenario: openspecファイル変更時にバリデーションが実行される
- **WHEN** `openspec/` 配下のファイルを変更してコミットしようとする
- **THEN** pre-commit が `openspec validate --strict --all` を実行する

#### Scenario: バリデーションエラーがある場合コミットがブロックされる
- **WHEN** `openspec validate --strict --all` がエラーを検出する
- **THEN** コミットが中止され、エラー内容が表示される

#### Scenario: コードのみの変更ではバリデーションがスキップされる
- **WHEN** `openspec/` 配下のファイルを変更せずにコミットする
- **THEN** openspec validate hook はスキップされる

### Requirement: GitHub Actions での openspec バリデーション
Pull Request 時に `openspec/` 配下のファイルが変更された場合、システムは CI で `openspec validate --strict --all` を実行し、エラーがある場合は PR のステータスチェックを失敗させなければならない（SHALL）。

#### Scenario: openspecファイル変更を含む PR で validate-docs ジョブが実行される
- **WHEN** `openspec/` 配下のファイルを含む Pull Request が作成または更新される
- **THEN** `validate-docs` ジョブが起動し `openspec validate --strict --all --no-interactive` を実行する

#### Scenario: openspecファイルを含まない PR では validate-docs がスキップされる
- **WHEN** `openspec/` 配下のファイルを変更しない Pull Request が作成される
- **THEN** `validate-docs` ジョブはスキップされる

#### Scenario: バリデーションエラーがある場合 PR がブロックされる
- **WHEN** `validate-docs` ジョブが実行され `openspec validate` がエラーを検出する
- **THEN** CI ステータスが failure となり PR のマージがブロックされる
