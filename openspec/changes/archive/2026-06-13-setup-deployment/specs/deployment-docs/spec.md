## ADDED Requirements

### Requirement: INSTALL.md に事前要件・インストール手順・ロールバック手順を記載する
`INSTALL.md` はサーバーの事前要件、初回インストール手順、バージョン更新手順、ロールバック手順を記載しなければならない（SHALL）。

#### Scenario: 事前要件の確認
- **WHEN** INSTALL.md を参照する
- **THEN** サーバーに必要なパッケージ（Python3, pip, PostgreSQL, nginx）とそのバージョン要件が明記されている

#### Scenario: ロールバック手順の確認
- **WHEN** INSTALL.md のロールバックセクションを参照する
- **THEN** `ln -sfn` と `systemctl restart` を使った手順が具体的なコマンド例とともに記載されている
