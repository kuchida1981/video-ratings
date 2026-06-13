## Context

`WorkDetailPage` には現在2つの動画再生経路がある：

1. **カバー画像オーバーレイの ▶ ボタン** — `handlePlay()` を呼び出し、隠し `<video>` 要素に src をセットして即座に `requestFullscreen()` する
2. **ファイルリストの ▶ ボタン** — `playingFileId` を toggle し、ファイル行の下に `<video controls autoPlay className="w-full">` をインライン表示する

ページ全体は `max-w-3xl` ラッパーに収まるため、インライン動画の幅は最大 768px に制限されている。

## Goals / Non-Goals

**Goals:**
- インライン動画からシアターモード（ビューポート全幅オーバーレイ）に切り替えられるようにする
- カバー画像の再生ボタンを廃止し、再生 UI をファイルリストに一本化する
- 実装をシンプルに保つ（カスタムコントロール不要）

**Non-Goals:**
- 動画コントロールのカスタム実装（シーク・音量・再生速度 UI の独自実装）
- ピクチャーインピクチャー対応
- 再生位置のインライン⇔シアター間での引き継ぎ

## Decisions

### 1. シアターモードは `position: fixed` オーバーレイで実装する

`position: fixed; inset: 0; z-index: 50; background: black` のラッパー div に `<video controls autoPlay className="w-full max-h-screen object-contain">` を配置する。`max-h-screen` + `object-contain` で動画のアスペクト比を維持しつつ画面内に収める。

**代替案として検討した方法:**
- `position: absolute` でコンテナから breakout — サイドバーを覆えないため不採用
- React Portal で `document.body` に mount — `fixed` だけで十分なため不採用

### 2. ネイティブ `controls` をそのまま使う

シアターモードの動画にも `controls` 属性を付与し、ブラウザネイティブのコントロールを使う。全画面ボタンはネイティブコントロールが提供する。カスタムコントロールの実装コストを避ける。

### 3. シアターモードボタンはインライン動画右上のホバーオーバーレイ

インライン動画を `relative` な div でラップし、`group` クラスを付与。内部に `absolute top-2 right-2` で配置したボタンを `opacity-0 group-hover:opacity-100` で表示する。ネイティブコントロールバー（下部）との干渉を避けるため上部に配置する。

**代替案として検討した方法:**
- 動画右下（ネイティブコントロールの横）— ブラウザ間でコントロールバーの高さが異なるため干渉リスクがある
- ファイル名横にシアターボタンを置く — 動画が表示される前に押せてしまい UX が不自然

### 4. 状態管理のシンプル化

カバー画像再生に関連する以下をすべて削除する：
- `playingFile` state
- `videoRef` (sr-only 要素)
- `handlePlay()` 関数
- `fullscreenchange` / `webkitfullscreenchange` イベントリスナー
- `webkitendfullscreen` イベントリスナー

シアターモード用に `theaterFile: WorkFile | null` state を1つ追加する。

## Risks / Trade-offs

- **タッチデバイスでホバーが効かない** → モバイル環境ではシアターボタンが表示されない可能性がある。現状このアプリはデスクトップ前提の運用のため許容する。必要になれば `group-focus-within:opacity-100` や長押し対応を後から追加できる。
- **OS 全画面から戻ったときシアターモードが維持される** → ブラウザの自動動作（fullscreenchange で動画が固定オーバーレイに戻る）に依存するため、特別な処理は不要。
- **ネイティブコントロールのデザインはブラウザ依存** → 統一した見た目にはならないが、実装コスト削減とのトレードオフとして許容する。
