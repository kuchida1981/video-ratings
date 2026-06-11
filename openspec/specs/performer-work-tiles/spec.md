# performer-work-tiles Specification

## Purpose

出演者詳細ページの出演作品タイルにおけるリッチ表示（maker/series・タグバッジ）の仕様を定義する。

## Requirements

### Requirement: 出演者詳細ページの出演作品はリッチタイルで表示する
システムは出演者詳細ページの出演作品セクションで、作品タイルに maker/series およびタグ（スコア付き）を追加表示しなければならない（SHALL）。

#### Scenario: maker と series が設定されている作品のタイル
- **WHEN** ユーザーが出演者詳細ページを表示する
- **THEN** 作品タイルに maker と series が「maker / series」形式で1行表示される

#### Scenario: maker のみ設定されている作品のタイル
- **WHEN** maker が設定されているが series が未設定の作品のタイルを表示する
- **THEN** maker のみが表示される（「/」の後の要素なし）

#### Scenario: maker も series も未設定の作品のタイル
- **WHEN** maker も series も未設定の作品のタイルを表示する
- **THEN** maker/series 行は表示されない

#### Scenario: タグが付いている作品のタイル
- **WHEN** タグが付いている作品のタイルを表示する
- **THEN** 各タグがバッジとして表示される

#### Scenario: スコアが設定されているタグのバッジ
- **WHEN** score が null でないタグのバッジを表示する
- **THEN** タグ名の後に「+N」形式でスコアが表示される

#### Scenario: スコアが null のタグのバッジ
- **WHEN** score が null のタグのバッジを表示する
- **THEN** タグ名のみ表示される（スコアサフィックスなし）
