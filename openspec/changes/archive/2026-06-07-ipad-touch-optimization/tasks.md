## 1. タイルグリッドのレスポンシブデフォルト列数

- [x] 1.1 `useTileMaxColumns.ts` の初期値ロジックを変更し、localStorage 未保存時は `window.innerWidth` から列数を決定する（< 900px → 3、< 1200px → 4、それ以上 → 6）

## 2. 絞り込みのタッチターゲット拡大

- [x] 2.1 `WorksPage.tsx` の絞り込みタグバッジ（`categories.map` 内の Badge）に `className="py-1.5"` を追加する
- [x] 2.2 `WorksPage.tsx` の検索・フィルタ Input（keyword・maker・series）を `h-11` に変更する

## 3. 動画再生 UI — カバー画像エリアのオーバーレイ

- [x] 3.1 `WorkDetailPage.tsx` に `useRef<HTMLVideoElement>(null)` と `playingFile: WorkFile | null` state を追加する
- [x] 3.2 `isSmbUrl` で絞った `smbFiles` 配列を導出し、カバー画像エリアの `<div className="relative aspect-video ...">` の内部に、`smbFiles` が存在する場合のみ ▶ ボタンリストのオーバーレイを追加する（ファイル名は `f.display_name` またはパス末尾 `f.path.split('/').pop()` を使用）
- [x] 3.3 DOM に不可視の `<video ref={videoRef} src={playingFile ? ...stream : ""} className="sr-only" />` を追加する
- [x] 3.4 ▶ ボタンのクリックハンドラを実装する：`setPlayingFile(file)` → `video.play()` → `video.webkitEnterFullscreen?.() ?? video.requestFullscreen?.()`（`src` は state 更新後に反映されるため `useEffect` で `play()` を呼び出す）
- [x] 3.5 全画面終了時（`fullscreenchange` / `webkitfullscreenchange` イベント）に `setPlayingFile(null)` をリセットするイベントリスナーを追加し、アンマウント時にクリーンアップする
