## Context

出演者・作品の詳細ページはそれぞれ `PerformerDetailPage.tsx` / `WorkDetailPage.tsx` に実装されている。ヘッダー部分に名前・タイトルが表示されており、ここに Google 検索リンクを追加する。lucide-react は既にプロジェクトで使用済み。

## Goals / Non-Goals

**Goals:**
- 出演者詳細ページのヘッダーにGoogle検索アイコンリンクを追加する
- 作品詳細ページのヘッダーにGoogle検索アイコンリンクを追加する
- 編集モード中はリンクを非表示にする

**Non-Goals:**
- 検索エンジンの切り替え機能
- 検索クエリのカスタマイズ機能

## Decisions

### URL 生成ロジック

検索クエリはキーワードをダブルクォートで囲み `encodeURIComponent` でエンコードする。

```ts
// 出演者ページ
const q = `"${performer.name}"`;

// 作品ページ（全出演者 + 作品タイトル）
const q = [...work.performers.map(p => `"${p.name}"`), `"${work.title}"`].join(" ");

const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
```

作品ページで出演者が 0 人の場合は作品タイトルのみのクエリになる。

### アイコンの選択

lucide-react の `Search` アイコンを使用する。`ExternalLink` より検索操作の意図が伝わりやすい。

### リンクの配置

名前・タイトルの右隣に `<a>` タグとして配置する。`target="_blank" rel="noopener noreferrer"` で新しいタブで開く。編集モード中 (`editing === true`) は非表示にする（既存の編集UI周辺をシンプルに保つため）。

## Risks / Trade-offs

- [長いクエリ] 出演者が多い作品では URL が長くなるが、Google の URL 長制限 (2048文字) には通常収まる → 特別な対処は不要
