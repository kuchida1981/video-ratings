## Why

動画を見ながらタグ評価を行うというユースケースにおいて、現在のインライン再生は `max-w-3xl` コンテナに収まる固定幅に限られており、動画をより広い表示領域で視聴する手段が全画面しかない。ブラウザのビューポート全幅を使うシアターモードを追加することで、ページを離れずに視聴体験を向上させる。

## What Changes

- **カバー画像上の再生ボタン（即・全画面）を廃止する** — ファイルリストの再生UIに一本化する
- インライン再生は維持する（評価しながら視聴するユースケースのため）
- インライン動画の右上にホバーで表示されるシアターモードボタンを追加する
- シアターモードは `position: fixed` でビューポート全体を覆うオーバーレイとして表示する（黒背景、ネイティブ controls 付き）
- シアターモード内のネイティブ全画面ボタンで OS 全画面へ遷移できる
- シアターモードは ✕ ボタンで閉じる

## Capabilities

### New Capabilities

- `video-theater-mode`: インライン動画プレーヤーからシアターモード（ビューポート全幅オーバーレイ）に切り替える機能

### Modified Capabilities

- `smb-video-streaming`: カバー画像エリアの再生 UI（即・全画面）を廃止し、ファイルリストの再生 UI のみに一本化する

## Impact

- `frontend/src/pages/WorkDetailPage.tsx`: カバー画像オーバーレイの再生ボタン・`handlePlay()`・`sr-only` video 要素・fullscreenchange イベントリスナーを削除。インライン動画のラッパーを追加し、シアターモードのオーバーレイ JSX を追加。
- `openspec/specs/smb-video-streaming/spec.md`: カバー画像再生 UI に関する Requirement を削除または更新
