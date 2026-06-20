## Context

`GET /works` の `list_works()` はレスポンスを手動でdict構築している。`TagInWorkList` スキーマは `score` フィールドを持つが、dict構築時に `wt.tag.score` を含めていないため、FastAPI の ResponseValidationError が発生し 500 を返す。

`Tag` モデルには `score` カラム（`Integer, nullable=True`）が存在しており、`wt.tag` 経由でアクセス可能。

## Goals / Non-Goals

**Goals:**
- `list_works()` のレスポンスに `score` を含め、500エラーを解消する

**Non-Goals:**
- レスポンス構築の仕組み自体のリファクタリング（手動dict → ORM `from_attributes` 等）
- 他のエンドポイントの見直し

## Decisions

`works.py:70` の tags dict comprehension に `"score": wt.tag.score` を追加する。`Tag.score` は nullable なので、`None` がそのまま返る場合があるが、`TagInWorkList.score` の型は `int | None` なのでバリデーションを通過する。

## Risks / Trade-offs

リスクなし。既存のスキーマ定義・モデル定義に沿った1行修正。
