# Spec: deploy-basic-auth

## Purpose

~~デプロイ時に HTTP Basic認証を環境変数で設定できるようにする機能。~~ **廃止**: セッション認証（session-auth）に完全移行。

## Requirements

### Requirement: 廃止済み
本機能はセッション認証（session-auth）への完全移行に伴い廃止された。システムは Basic 認証による保護を提供してはならない（SHALL NOT）。新規実装は session-auth spec を参照すること。

#### Scenario: 本specの要件は適用されない
- **WHEN** セッション認証が有効である
- **THEN** Basic認証の設定は不要であり、本specの要件は適用されない
