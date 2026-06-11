## Context

`openspec validate --strict --all` を実行すると38件中28件のspecsがエラーになっている。エラーは3パターン：

- **パターンA (5件)**: `## Purpose` / `## Requirements` セクションヘッダーが欠如し、`### Requirement:` から直接始まっている
- **パターンB (22件)**: Requirement テキストに SHALL/MUST キーワードがない（日本語の「しなければならない」はあるが英語キーワードなし）
- **パターンC (1件)**: `list-column-config` — `## Requirements` セクションが空

また、`.pre-commit-config.yaml` と `.github/workflows/ci.yml` にはコードの品質チェックは組み込まれているが、openspecドキュメントのバリデーションは含まれていない。

openspecのパッケージ名: `@fission-ai/openspec@1.4.1`

## Goals / Non-Goals

**Goals:**
- `openspec validate --strict --all` が 38/38 pass する状態にする
- pre-commit で openspec/ 配下の変更時に自動バリデーションを実行する
- GitHub Actions で PR 時に openspec ドキュメントの整合性を検証する

**Non-Goals:**
- 既存specsの要件内容（ビジネスロジック）の変更
- `--strict` 以外のオプションで新たなルールを追加すること

## Decisions

### 1. spec修正方針: 内容を変えずフォーマットのみ修正する

パターンAは `## Purpose\n\n<既存内容の要約>\n\n## Requirements\n` を先頭に追加し、既存の `### Requirement:` ブロックをその下に収める。パターンBは各 Requirement の文末に `（SHALL）` を追記する。パターンCは `list-column-config` の既存Purposeに沿った要件を追加する。

**Alternatives**: 要件文を英語に書き直す案もあったが、日本語での記述を維持しつつ SHALL キーワードを括弧書きで補う既存パターン（ci-pipeline 等で実績あり）に統一する。

### 2. pre-commit hook: files フィルターで openspec/ 限定

```yaml
- id: openspec-validate
  name: openspec validate (strict)
  entry: openspec validate --strict --all --no-interactive
  language: system
  files: ^openspec/
  pass_filenames: false
```

`files: ^openspec/` により、openspec/ 配下のファイルが変更されたコミットのみで実行される。コードのみの変更では実行されない。

### 3. GitHub Actions: paths フィルターを使った専用ジョブ追加

既存の `changes` ジョブ（dorny/paths-filter）に `openspec` パスを追加し、変更があった場合のみ `validate-docs` ジョブが実行されるようにする。

```yaml
openspec:
  - 'openspec/**'
```

```yaml
validate-docs:
  needs: changes
  if: needs.changes.outputs.openspec == 'true'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "lts/*"
    - name: Install openspec
      run: npm install -g @fission-ai/openspec
    - name: Validate openspec docs
      run: openspec validate --strict --all --no-interactive
```

**Alternatives**: `actions/setup-node` キャッシュも検討したが、openspec はインストールが軽量なためキャッシュ設定なしでシンプルに実装する。

## Risks / Trade-offs

- [openspec のバージョン固定なし] → CI で常に最新版がインストールされるため、破壊的変更があると CIが落ちる可能性。ただし現状は minor バージョンの更新頻度が低いため許容する。必要になれば `@fission-ai/openspec@1.4.1` のようにバージョンを固定する。
- [パターンB の修正量が多い] → 22件のファイルを編集する必要があるが、各変更は1行追記のシンプルな修正。
