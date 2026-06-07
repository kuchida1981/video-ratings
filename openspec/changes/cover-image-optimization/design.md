## Context

カバー画像機能を導入した結果、一覧ページで最大 13MB のフルサイズ画像を 36 枚同時にダウンロードする状況が発生している。現状は `CoverUploadZone` が受け取ったファイルをそのまま multipart POST し、FastAPI `StaticFiles` が無加工で配信する。ブラウザは 200〜300px 幅のタイル表示のために 51MB を転送している。

既存ファイルはすべて JPEG（`identify` で確認済み）。最大は 4260x2858px・13MB。

## Goals / Non-Goals

**Goals:**
- 新規アップロード時にブラウザ側でリサイズ・圧縮し、転送量を削減する
- `<img loading="lazy">` で初期描画時の並列ダウンロードを抑制する
- 一回限りのスクリプトで既存画像を一括リサイズし、再アップロードを不要にする

**Non-Goals:**
- サーバー側のオンザフライリサイズ（不要）
- WebP 変換（JPEG のみに統一して複雑さを避ける）
- 元画像の保存（個人利用のため不要）
- 画像 CDN / オブジェクトストレージへの移行

## Decisions

### ブラウザ側リサイズに Canvas API を使う

`CoverUploadZone` でファイル受領後、`HTMLCanvasElement.toBlob()` でリサイズした JPEG を生成してから upload する。ライブラリ追加なし。ファイル選択・ドラッグ&ドロップ・クリップボード貼り付けのすべての経路を一箇所でカバーできる。

- 最大幅: **1200px**（詳細ページでも十分な解像度、4K 画像に対して 1/12 以下のサイズ）
- 出力形式: **JPEG, quality 0.85**（既存ファイルと統一、WebP より互換性が高い）
- ファイル名: `image.jpg` に固定（バックエンドの拡張子 allowlist と一致）

代替として考えたサーバー側リサイズは、Pillow の常駐依存と全 upload エンドポイントの修正が必要になるため採用しない。

### 既存ファイルは one-shot スクリプトで in-place リサイズ

`backend/scripts/resize_covers.py` を新規作成。`uploads/covers/` 以下の JPEG を走査し、幅 1200px 超のものだけリサイズして上書き保存する。パスが変わらないため DB 更新不要。

Pillow は manylinux ホイールに libjpeg がバンドルされているため、Dockerfile への apt 追加は不要。`pyproject.toml` に `Pillow>=11.0.0` を追加するのみ。

### lazy loading はネイティブ属性で対応

`<img loading="lazy">` を `WorkTile` と `PerformerTile` の `<img>` に追加する。ライブラリ不要で Intersection Observer を自動的に利用する。

## Risks / Trade-offs

- **元画像を上書きするため不可逆** → 個人利用かつ元ファイルはアップロード元に存在するため許容
- **Canvas API の色空間変換** → ブラウザ実装により EXIF の色空間情報が失われることがあるが、カバー画像用途では無視できる
- **Pillow が migration script 専用の依存になる** → 将来のサーバー側リサイズが必要になった際に再利用可能なため冗長ではない

## Migration Plan

1. フロントエンド変更をデプロイ（lazy loading + ブラウザリサイズ）
2. コンテナをリビルド（Pillow 追加）
3. スクリプト実行: `docker compose exec backend python scripts/resize_covers.py`
4. 完了ログでリサイズ件数を確認

ロールバック: スクリプト実行前のファイルはホスト側 `./backend/uploads/covers/` にあるため、git 管理外だが手動バックアップで対応可能。

## Open Questions

なし
