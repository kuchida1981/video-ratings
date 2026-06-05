# Spec: performers-list-work-count

## Purpose

出演者一覧における出演作数の表示に関する仕様。出演者一覧APIのレスポンスと、フロントエンドの出演者一覧テーブルの表示形式を定義する。

## Requirements

### Requirement: 出演者一覧レスポンスに出演作数を含む
出演者一覧APIのレスポンスには、各出演者の出演作数（work_count）を含む。

#### Scenario: 出演作あり
- **WHEN** 出演作が登録されている出演者が返される
- **THEN** work_count フィールドに出演作の件数が含まれる

#### Scenario: 出演作なし
- **WHEN** 出演作が1件もない出演者が返される
- **THEN** work_count フィールドが 0 になる

---

### Requirement: 出演者一覧テーブルに出演作数列を表示
出演者一覧テーブルに「出演作数」列を追加する。

#### Scenario: 出演作数の表示
- **WHEN** 出演者一覧テーブルを表示する
- **THEN** 各出演者行に出演作数が数値で表示される
