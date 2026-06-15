# performer-work-tiles Specification

## Purpose

出演者詳細ページの出演作品タイルにおけるリッチ表示（maker/series・タグバッジ）の仕様を定義する。
## Requirements
### Requirement: 出演者詳細ページの出演作品はリッチタイルで表示する
システムは出演者詳細ページの出演作品セクションで、作品タイルにタグ（スコア付き）を表示しなければならない（SHALL）。

#### Scenario: タグが付いている作品のタイル
- **WHEN** タグが付いている作品のタイルを表示する
- **THEN** 各タグがバッジとして表示される

#### Scenario: スコアが設定されているタグのバッジ
- **WHEN** score が null でないタグのバッジを表示する
- **THEN** タグ名の後に「+N」形式でスコアが表示される

#### Scenario: スコアが null のタグのバッジ
- **WHEN** score が null のタグのバッジを表示する
- **THEN** タグ名のみ表示される（スコアサフィックスなし）

