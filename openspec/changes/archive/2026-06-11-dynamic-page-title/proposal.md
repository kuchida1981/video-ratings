## Why

現在、Video Ratingsアプリのブラウザタブに表示されるタイトル（`document.title`）は、どのページを表示しているときも "Video Ratings" のまま固定されている。
SPA（Single Page Application）において、表示している画面（作品一覧、作品詳細、出演者一覧、設定など）に応じてタブ名が変化しないことは、ユーザーが複数のタブを開いて並行作業する際の利便性や作業効率を著しく低下させるため、改善が必要である。

## What Changes

- ブラウザのタブ名（`document.title`）を、表示中の画面に応じた動的な値に変更する。
- 命名規則は `"ページタイトル | Video Ratings"` とする。
  - 静的ページ（例：作品一覧、出演者一覧、タグ管理、設定）では、それぞれの画面名を表示する。
  - 動的ページ（例：作品詳細、出演者詳細）では、APIから取得した「作品名」や「出演者名」を表示する。読み込み中はフォールバック名（「作品詳細」「出演者詳細」）を使用する。
- 各コンポーネントから共通のインターフェースでタイトルを設定できるよう、Reactカスタムフック `useDocumentTitle` を新しく実装する。

## Capabilities

### New Capabilities

- `dynamic-page-title`: 各ページのコンテンツ（静的なページ名、または作品名・出演者名などの動的データ）に基づき、ブラウザのタブ名（`document.title`）を「ページ名 | Video Ratings」の形式で自動更新する機能。

## Impact

- `frontend/src/hooks/useDocumentTitle.ts`: 新規作成。タイトル設定用のカスタムフック。
- `frontend/src/pages/WorksPage.tsx`: カスタムフックを呼び出し、タイトルを「作品一覧 | Video Ratings」に設定。
- `frontend/src/pages/PerformersPage.tsx`: カスタムフックを呼び出し、タイトルを「出演者一覧 | Video Ratings」に設定。
- `frontend/src/pages/TagsPage.tsx`: カスタムフックを呼び出し、タイトルを「タグ管理 | Video Ratings」に設定。
- `frontend/src/pages/SettingsPage.tsx`: カスタムフックを呼び出し、タイトルを「設定 | Video Ratings」に設定。
- `frontend/src/pages/WorkDetailPage.tsx`: カスタムフックを呼び出し、作品取得後は作品名、取得前は「作品詳細」をタイトルに設定。
- `frontend/src/pages/PerformerDetailPage.tsx`: カスタムフックを呼び出し、出演者取得後は出演者名、取得前は「出演者詳細」をタイトルに設定。
