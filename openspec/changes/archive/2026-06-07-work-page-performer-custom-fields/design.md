## Context

作品詳細ページ（`WorkDetailPage`）は出演者ごとにカードを描画し、タグ評価の表示・編集はできる。出演者のカスタム項目は `performers.custom_fields` (JSONB) として DB に保存済みで、`PerformerDetailPage` での編集も実装済み。しかし作品詳細のAPIレスポンス（`PerformerInWork`）には `custom_fields` が含まれておらず、`WorkDetailPage` から直接参照・編集できない。

## Goals / Non-Goals

**Goals:**
- 作品詳細ページの各出演者カードで performer カスタム項目を表示・編集できる
- 既存の `PerformerDetailPage` と同じ操作体験（`onBlur` 保存、boolean は即時保存）を提供する
- カスタム項目定義が0件の場合はUIを一切表示しない

**Non-Goals:**
- 新しいAPIエンドポイントの追加（既存の `PATCH /performers/{id}/custom-fields` を再利用する）
- カスタム項目定義の新規作成・削除（`CustomFieldsPage` の責務）
- 出演者カードのレイアウト変更（カスタム項目はタグ評価の下に追加するだけ）

## Decisions

### 1. `PerformerInWork` に `custom_fields` を追加する

バックエンドの `PerformerInWork` Pydantic スキーマと `_build_work_response` の performer dict に `custom_fields` を追加する。

**代替案**: フロントエンドが `work` ロード後に各出演者を個別に取得する。  
**却下理由**: 出演者が複数いる場合に N+1 リクエストが発生する。作品詳細の単一レスポンスに含める方が効率的。

### 2. 出演者カスタム項目の state を performerId キーで管理する

`WorkDetailPage` では複数の出演者が同時に表示されるため、1つの `customFieldValues` state では管理できない。

```typescript
// 出演者ごとの値を Record でネスト管理
const [performerCFValues, setPerformerCFValues] =
  useState<Record<number, Record<string, string | boolean>>>({});
```

**代替案**: 出演者カードをコンポーネントに切り出してローカル state を持たせる。  
**採用しない理由**: 現状の `WorkDetailPage` は全てインライン実装であり、この変更のためだけにコンポーネント分割するのは過剰なリファクタリングになる。state の追加で対応できる。

### 3. 保存パターンは `PerformerDetailPage` と同じにする

- text / number / date: `onBlur` で `api.performers.updateCustomFields` を呼ぶ
- boolean: `onChange` で即時保存

既存エンドポイント `PATCH /performers/{id}/custom-fields` をそのまま利用する。

## Risks / Trade-offs

- [リスク] 出演者カードが縦に長くなる → カスタム項目が多い場合に視認性が下がる可能性がある。現状は許容する（定義件数は通常少ない）。
- [リスク] `WorkDetailPage` の `reload()` は作品全体を再取得するため、カスタム項目保存のたびに performers も再フェッチされる。パフォーマンス上の問題は現状のデータ規模では無視できる。
