# Works List Sort by Title and Performer Spec

## Purpose

作品一覧画面にタイトル順・出演者ふりがな順のソートボタンを追加し、ユーザーが任意の基準で作品を並べ替えられるようにする。

## Requirements

### Requirement: タイトル順ソート
The system SHALL support sorting works by title in Unicode order (case-insensitive).
システムは作品一覧をタイトルの Unicode 順（大文字小文字無視）で昇順/降順にソートできなければならない。

#### Scenario: タイトル昇順でソートできる
- **WHEN** ユーザーが「タイトル順」ボタンを選択する（初回）
- **THEN** システムは `sort_by=title&sort_desc=false` でリクエストし、タイトルの Unicode 昇順で作品を表示する

#### Scenario: タイトル昇順/降順を切り替えられる
- **WHEN** すでにタイトル順が選択されている状態でユーザーが「タイトル順」ボタンを再度押す
- **THEN** システムは昇順/降順を反転して再ソートする

---

### Requirement: 出演者ふりがな順ソート
The system SHALL support sorting works by the furigana of the main performer (is_main=True).
システムは作品一覧をメイン出演者（is_main=True）のふりがな順で昇順/降順にソートできなければならない。

#### Scenario: 出演者ふりがな昇順でソートできる
- **WHEN** ユーザーが「出演者順」ボタンを選択する（初回）
- **THEN** システムは `sort_by=performer_furigana&sort_desc=false` でリクエストし、メイン出演者のふりがな昇順で作品を表示する

#### Scenario: 出演者ふりがな昇順/降順を切り替えられる
- **WHEN** すでに出演者順が選択されている状態でユーザーが「出演者順」ボタンを再度押す
- **THEN** システムは昇順/降順を反転して再ソートする

#### Scenario: ふりがななしの作品は末尾に固定される
- **WHEN** 出演者ふりがな順でソートされている
- **THEN** メイン出演者が存在しない・ふりがなが未設定の作品は、昇順/降順に関わらず常にリストの末尾に表示される
