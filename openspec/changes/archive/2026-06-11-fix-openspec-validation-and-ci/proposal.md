## Why

`openspec validate --strict --all` を実行すると38件中28件のspecs がエラーになっており、ドキュメントの品質基準が守られていない。またこれらのエラーが自動的に検出・防止される仕組みがないため、今後も同様の問題が蓄積するリスクがある。

## What Changes

- 28件の failing specs を修正して `openspec validate --strict --all` が全件 pass する状態にする
  - パターンA (5件): `## Purpose` / `## Requirements` ヘッダーが欠如しているため追加する
  - パターンB (22件): Requirement テキストに SHALL/MUST キーワードが含まれていないため追記する
  - パターンC (1件): `list-column-config` の `## Requirements` セクションが空のため内容を追加する
- `.pre-commit-config.yaml` に `openspec validate` hook を追加する（`openspec/` 配下の変更時のみ実行）
- `.github/workflows/ci.yml` に openspec validate ジョブを追加する

## Capabilities

### New Capabilities

- `openspec-doc-validation`: CI および pre-commit での openspec ドキュメント自動バリデーション

### Modified Capabilities

<!-- なし — 既存specsのフォーマット修正は要件の変更ではなくスキーマへの準拠修正 -->

## Impact

- `openspec/specs/` 配下の28ファイル（内容は変えず、フォーマット・キーワードを修正）
- `.pre-commit-config.yaml`（hook 追加）
- `.github/workflows/ci.yml`（ジョブ追加）
