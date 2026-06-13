## 1. カバー画像再生 UI の削除

- [ ] 1.1 `WorkDetailPage` から `playingFile` state を削除する
- [ ] 1.2 `handlePlay()` 関数を削除する
- [ ] 1.3 `videoRef` (sr-only video 要素) を削除する
- [ ] 1.4 `fullscreenchange` / `webkitfullscreenchange` / `webkitendfullscreen` イベントリスナーの useEffect を削除する
- [ ] 1.5 `playingFile` の src クリア処理の useEffect を削除する
- [ ] 1.6 カバー画像エリアの `smbFiles.map` で生成している ▶ ボタン群 (`absolute inset-0` オーバーレイ) を削除する

## 2. シアターモード state の追加

- [ ] 2.1 `theaterFile: WorkFile | null` state を追加する

## 3. インライン動画をシアターボタン付きラッパーで包む

- [ ] 3.1 ファイルリストの `<video>` 要素を `relative group` な div でラップする
- [ ] 3.2 ラッパー内右上に `absolute top-2 right-2 opacity-0 group-hover:opacity-100` のシアターボタンを追加する（アイコンは `RectangleHorizontal` 等の monitor/theater 系アイコン）
- [ ] 3.3 シアターボタンのクリックで `setTheaterFile(f)` を呼び出す

## 4. シアターモードオーバーレイの実装

- [ ] 4.1 `theaterFile` が非 null のとき `position: fixed; inset: 0; z-index: 50; background: black` のオーバーレイ div を描画する
- [ ] 4.2 オーバーレイ内に `controls autoPlay className="w-full max-h-screen object-contain"` な `<video>` を配置し `src` に stream URL をセットする
- [ ] 4.3 オーバーレイ右上に ✕ ボタンを配置し、クリックで `setTheaterFile(null)` を呼び出す
