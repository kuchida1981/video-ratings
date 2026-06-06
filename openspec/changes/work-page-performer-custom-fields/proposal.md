## Why

作品詳細ページの出演者カードにはタグ評価は表示・編集できるが、出演者のカスタム項目は表示されない。出演者のカスタム項目を確認・更新するには都度出演者詳細ページに遷移する必要があり、作品を軸に情報をまとめて扱いたいユースケースで不便である。

## What Changes

- 作品詳細ページの各出演者カードに、出演者用カスタム項目の表示・編集UIを追加する
- バックエンドの作品詳細レスポンスに各出演者の `custom_fields` を含める
- カスタム項目が0件の場合はセクションを表示しない（既存ユーザーへの影響なし）

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `custom-fields`: 出演者カスタム項目の編集が作品詳細ページの出演者カードからも行えるよう要件を拡張する

## Impact

- `backend/app/schemas/work.py` — `PerformerInWork` に `custom_fields` フィールドを追加
- `backend/app/routers/works.py` — `_build_work_response` の performer dict に `custom_fields` を含める
- `frontend/src/types/index.ts` — `PerformerInWork` 型に `custom_fields` を追加
- `frontend/src/pages/WorkDetailPage.tsx` — performer CF定義の取得・値の state管理・編集UIのレンダリングを追加
- APIの後方互換性: `PerformerInWork` にフィールドが追加されるのみ（破壊的変更なし）
