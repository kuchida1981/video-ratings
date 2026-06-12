## Why

作品一覧・出演者一覧のタイル/リスト表示切り替えは、ページを離れると常にタイル表示にリセットされる。ユーザーがリスト表示を好む場合、毎回切り替える手間が発生するため、選択状態を記憶する。

## What Changes

- WorksPage のタイル/リスト表示切り替え状態を localStorage に永続化する
- PerformersPage のタイル/リスト表示切り替え状態を localStorage に永続化する
- viewMode は既存のフィルター状態とは別キーで保存する（リセット対象外）

## Capabilities

### New Capabilities

- `view-mode-persistence`: 作品一覧・出演者一覧のタイル/リスト表示モードを localStorage に保存・復元する機能

### Modified Capabilities

（なし）

## Impact

- `frontend/src/pages/WorksPage.tsx`: viewMode の初期化・保存ロジックを追加
- `frontend/src/pages/PerformersPage.tsx`: viewMode の初期化・保存ロジックを追加
- localStorage キーを2つ追加: `video-ratings:works-view-mode`, `video-ratings:performers-view-mode`
- バックエンド・API への影響なし
