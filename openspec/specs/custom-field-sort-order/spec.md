# Custom Field Sort Order Spec

## Purpose

カスタム項目定義に表示順（sort_order）を持たせ、entity_type（work / performer）ごとに独立して管理する機能を提供する。ユーザーは設定UIでドラッグ＆ドロップにより表示順を変更できる。

## Requirements

### Requirement: カスタム項目定義の表示順管理
システムはカスタム項目定義に表示順（sort_order）を持ち、entity_type（work / performer）ごとに独立して管理しなければならない。list API は sort_order 昇順で返す。

#### Scenario: 作品用カスタム項目が sort_order 順で返される
- **WHEN** クライアントが entity_type=work でカスタム項目定義一覧を取得する
- **THEN** システムは作品用カスタム項目を sort_order 昇順で返す

#### Scenario: 出演者用カスタム項目が sort_order 順で返される
- **WHEN** クライアントが entity_type=performer でカスタム項目定義一覧を取得する
- **THEN** システムは出演者用カスタム項目を sort_order 昇順で返す

---

### Requirement: カスタム項目定義の並び替え
システムはユーザーが設定UIでカスタム項目の表示順をドラッグ＆ドロップで変更できなければならない。並び替えは entity_type ごとに独立して行われる。

#### Scenario: 設定UIで作品用カスタム項目をD&Dで並び替えできる
- **WHEN** ユーザーが設定UIの作品用カスタム項目リストで行をドラッグして順序を変更する
- **THEN** システムは新しい順序を保存し、その後の一覧取得で変更後の順序で返す

#### Scenario: 設定UIで出演者用カスタム項目をD&Dで並び替えできる
- **WHEN** ユーザーが設定UIの出演者用カスタム項目リストで行をドラッグして順序を変更する
- **THEN** システムは新しい順序を保存し、その後の一覧取得で変更後の順序で返す

#### Scenario: 並び替えが作品詳細画面に反映される
- **WHEN** ユーザーが設定UIで作品用カスタム項目の順序を変更する
- **THEN** 作品詳細画面のカスタム項目は新しい順序で表示される

#### Scenario: 並び替えが出演者詳細画面に反映される
- **WHEN** ユーザーが設定UIで出演者用カスタム項目の順序を変更する
- **THEN** 出演者詳細画面のカスタム項目は新しい順序で表示される

---

### Requirement: カスタム項目新規作成時の表示順
システムは新たに作成されたカスタム項目定義を、同じ entity_type 内の末尾（最大 sort_order + 1）に配置しなければならない。

#### Scenario: 新規作成した項目が末尾に追加される
- **WHEN** ユーザーが新しいカスタム項目定義を作成する
- **THEN** その項目は同じ entity_type の既存項目の末尾に表示される
