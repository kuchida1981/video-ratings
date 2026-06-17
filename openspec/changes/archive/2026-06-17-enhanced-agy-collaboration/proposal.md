## Why

Claude Code と agy (Antigravity CLI) の協業において、実運用上の問題が顕在化している。agy が対話的入力待ち（y/n プロンプト等）でハングし、Claude Code がそれを検知・復帰できないまま待ち続けるケースが頻発する。また、一括委譲方式では失敗時のリカバリコストが高く、Claude Code のクレジット消費も最適化の余地がある。

agy 自身が `--print-timeout` や `--continue` といった機能を既に備えており、これらを活用することで追加ツール導入なしにワークフローを大幅に改善できる。

## What Changes

- agy 呼び出し時に `--print-timeout` を必須とし、ハング時の自動タイムアウトを保証する
- 対話的入力を避けるためのプロンプトルールと環境変数設定を標準化する
- 一括委譲から OpenSpec tasks.md のタスク単位での分割呼び出しに変更する
- タイムアウト・中断時に `--continue` で同じ会話を再開するリカバリパターンを導入する
- 実装後に別セッションの agy でレビューさせるフローを追加する
- agy に変更要約（REVIEW.md 相当）を生成させ、Claude のレビュー時のコンテキスト消費を抑制する

## Capabilities

### New Capabilities
- `agy-invocation-protocol`: agy の呼び出し方法、タイムアウト設定、ハング予防ルール、リカバリパターンを定義する
- `agy-review-flow`: agy による別セッションレビューと変更要約生成のフローを定義する

### Modified Capabilities

（既存 spec への要件変更なし。本変更は CLAUDE.md のワークフロー規約のみに影響する）

## Impact

- **CLAUDE.md**: 「Claude Code から agy を呼び出す方法」「agy との対話ループ」「機能追加・バグ修正の標準フロー」セクションを改訂
- **開発ワークフロー**: 実装委譲の粒度がタスク単位に細分化される
- **クレジット消費**: Claude Code のコンテキスト読み込み量が削減される見込み
