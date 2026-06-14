## ADDED Requirements

### Requirement: サイドバーの折りたたみ/展開トグル
サイドバーはトグルボタンにより展開状態と折りたたみ状態を切り替えられる SHALL。折りたたみ状態はブラウザの `localStorage`（キー: `sidebar-collapsed`）に永続化され SHALL、ページリロード後も維持される SHALL。

#### Scenario: 展開状態でトグルボタンをクリックする
- **WHEN** サイドバーが展開状態のときトグルボタンをクリックする
- **THEN** サイドバーが折りたたみ状態（w-12）に切り替わる
- **THEN** `localStorage` の `sidebar-collapsed` が `"true"` に設定される

#### Scenario: 折りたたみ状態でトグルボタンをクリックする
- **WHEN** サイドバーが折りたたみ状態のときトグルボタンをクリックする
- **THEN** サイドバーが展開状態（w-48）に切り替わる
- **THEN** `localStorage` の `sidebar-collapsed` が `"false"` に設定される

#### Scenario: ページリロード後に折りたたみ状態が復元される
- **WHEN** `localStorage` の `sidebar-collapsed` が `"true"` の状態でページをリロードする
- **THEN** サイドバーが折りたたみ状態で表示される

### Requirement: 折りたたみ時のナビゲーション表示
折りたたみ状態のとき、ナビゲーション項目はアイコンのみを表示し SHALL、ラベルテキストは非表示になる SHALL。

#### Scenario: 折りたたみ状態でのナビゲーション項目表示
- **WHEN** サイドバーが折りたたみ状態である
- **THEN** ナビゲーション項目のアイコンのみが表示される
- **THEN** ラベルテキスト（"作品"、"出演者"、"タグ管理"、"設定"）は表示されない

#### Scenario: 折りたたみ状態でのツールチップ表示
- **WHEN** サイドバーが折りたたみ状態でナビゲーションアイコンにホバーする
- **THEN** そのナビゲーション項目のラベルテキストがツールチップとして表示される

### Requirement: 折りたたみ時のヘッダー表示
折りたたみ状態のとき、サイドバーヘッダーは favicon 画像のみを表示し SHALL、"Video Ratings" テキストとバージョン番号は非表示になる SHALL。

#### Scenario: 展開状態でのヘッダー表示
- **WHEN** サイドバーが展開状態である
- **THEN** favicon 画像と "Video Ratings" テキストが並んで表示される
- **THEN** バージョン番号がサイドバー下部に表示される

#### Scenario: 折りたたみ状態でのヘッダー表示
- **WHEN** サイドバーが折りたたみ状態である
- **THEN** favicon 画像のみが表示される
- **THEN** "Video Ratings" テキストは表示されない
- **THEN** バージョン番号は表示されない

### Requirement: 折りたたみアニメーション
サイドバーの幅変化は CSS トランジション（`transition-all duration-200`）でアニメーションされる SHALL。

#### Scenario: アニメーション付きで折りたたむ
- **WHEN** トグルボタンをクリックしてサイドバーの状態が切り替わる
- **THEN** サイドバーの幅が 200ms のトランジションで滑らかに変化する
