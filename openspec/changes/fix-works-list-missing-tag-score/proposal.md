## Why

`GET /works` エンドポイントの `list_works()` で、レスポンスの tags に `score` フィールドを含めていないため、`TagInWorkList` スキーマのバリデーションで `ResponseValidationError` (500) が発生する。spec (`works-list-display`) では tags に id・name・category_id・score を含むことが明記されており、スキーマ定義 (`TagInWorkList`) にも `score` フィールドが存在するが、手動dict構築時に `score` が欠落している。

## What Changes

- `backend/app/routers/works.py` の `list_works()` 内のtags dict構築に `score` フィールドを追加する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

なし（既存specの要件通りに実装を修正するバグ修正のため）

## Impact

- `backend/app/routers/works.py`: `list_works()` のレスポンス構築を1行修正
- 影響範囲は `GET /works` エンドポイントのみ
- フロントエンドへの影響なし（スキーマ定義は既に score を含んでおり、フロントエンドもそれを前提としている）
