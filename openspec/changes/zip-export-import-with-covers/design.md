## Context

現在の `GET /export` はDBデータをJSONで返し、`POST /import` はJSON bodyを受け取る。カバー画像（`uploads/covers/works/`・`uploads/covers/performers/`）はこの対象外であり、インポート後に画像が消える。

`Work.cover_image_path` / `Performer.cover_image_path` はそれぞれ `works/<filename>` / `performers/<filename>` 形式の相対パスをDBに保持しており、実ファイルは `uploads/covers/<relative_path>` に置かれる。

## Goals / Non-Goals

**Goals:**
- エクスポートでDBデータと全カバー画像を単一ZIPファイルとして出力する
- インポートでZIPからDBデータと画像を完全復元する（洗い替え）
- Python stdlib の `zipfile` のみ使用し、新たな依存を追加しない

**Non-Goals:**
- ZIPファイルの内容プレビュー（インポート前の確認はファイル名のみ）
- 差分インポート・マージ
- 画像の圧縮・変換

## Decisions

### ZIP形式 vs base64 JSON埋め込み

**採用: ZIP**

base64埋め込みはファイルが単一JSONになる反面、エンコードで約33%サイズ増、テキストエディタでの確認が実質不可能。ZIPは単一ファイルとして配布でき、内容も検査しやすい。インポート側も multipart upload として素直に実装できる。

### ZIPの内部構造

```
video-ratings-export-YYYY-MM-DD.zip
├── data.json        ← 既存の export JSON と同一内容
└── covers/
    ├── works/       ← uploads/covers/works/ の内容
    └── performers/  ← uploads/covers/performers/ の内容
```

`covers/` 内のパス構造はDBの `cover_image_path` と一致させる。これにより import 時に `covers/<cover_image_path>` でそのまま取り出せる。

### インポート時の画像置換

インポートはDBと同じく完全洗い替え（全削除→全再挿入）。`uploads/covers/` 配下を全削除してからZIPの `covers/` を展開する。DB commit と同じトランザクション境界内で処理するが、ファイルシステム操作は非トランザクショナルなため、DB rollback 時は削除済み画像が復元されない点を許容する（バックアップ用途として通常操作では発生しない）。

### フロントエンドのインポートフロー変更

現行フロー: ファイル選択 → FileReader でJSON解析 → 確認ダイアログ → POST JSON  
変更後フロー: ファイル選択 → 確認ダイアログ（ファイル名表示）→ FormData でPOST ZIP  

ZIPはクライアント側で解析不要なため FileReader は不要になる。確認ダイアログは引き続き表示する。

## Risks / Trade-offs

- **大容量ZIP**: 画像が多数ある場合にZIPが数百MB以上になる可能性 → バックアップ用途のため許容。タイムアウト設定は既存のまま。
- **ファイルシステムとDBの非原子性**: DB commit 後にファイル展開が失敗するとDBと画像が不整合 → エラー時にHTTP 500を返すが復旧はユーザー側の再インポートに依存。
- **cover_image_path はあるが実ファイルが欠損**: エクスポート時にパスが存在しないファイルはスキップし、ZIP には含めない。インポート後も同様に欠損したまま（現状と同じ挙動）。
