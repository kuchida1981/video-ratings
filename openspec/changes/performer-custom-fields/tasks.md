## 1. Backend: マイグレーション

- [ ] 1.1 `003_performer_custom_fields.py` を作成: `custom_field_definitions` に `entity_type VARCHAR NOT NULL DEFAULT 'work'` を追加
- [ ] 1.2 同マイグレーションで `performers` に `custom_fields JSONB DEFAULT '{}'` を追加
- [ ] 1.3 `downgrade()` 関数を実装してロールバックに対応

## 2. Backend: モデル・スキーマ・ルーター

- [ ] 2.1 `models.py` の `CustomFieldDefinition` に `entity_type` カラムを追加
- [ ] 2.2 `models.py` の `Performer` に `custom_fields` カラムを追加
- [ ] 2.3 `schemas/custom_field.py` の `FieldType` enum に `boolean` を追加
- [ ] 2.4 `schemas/custom_field.py` の `CustomFieldDefinitionCreate` と `CustomFieldDefinitionResponse` に `entity_type` フィールドを追加
- [ ] 2.5 `routers/custom_fields.py` の一覧取得エンドポイントに `entity_type` クエリパラメータによるフィルタリングを追加
- [ ] 2.6 `schemas/performer.py` のレスポンスに `custom_fields` フィールドを追加
- [ ] 2.7 `routers/performers.py` に `PATCH /performers/{id}/custom-fields` エンドポイントを追加（works の実装に倣う）

## 3. Frontend: 型定義・API クライアント

- [ ] 3.1 `types/index.ts` の `CustomFieldDefinition.field_type` に `"boolean"` を追加
- [ ] 3.2 `types/index.ts` の `CustomFieldDefinition` に `entity_type: "work" | "performer"` を追加
- [ ] 3.3 `types/index.ts` の `Performer` に `custom_fields: Record<string, unknown> | null` を追加
- [ ] 3.4 `api/client.ts` の performers API に `updateCustomFields(id, fields)` メソッドを追加

## 4. Frontend: 設定ページ（CustomFieldsPage）

- [ ] 4.1 `CustomFieldsPage.tsx` でカスタム項目定義を `entity_type` でフィルタして取得するよう修正（`api.customFields.list("work")` / `api.customFields.list("performer")`）
- [ ] 4.2 ページを「作品用カスタム項目」と「出演者用カスタム項目」の2セクションに分割
- [ ] 4.3 項目追加フォームに `entity_type` の選択（またはセクション別フォーム）を追加
- [ ] 4.4 型選択に「チェックボックス（boolean）」を追加
- [ ] 4.5 型ラベル変換関数 `typeLabel` に `boolean` → `"チェックボックス"` を追加

## 5. Frontend: 作品詳細ページ（WorkDetailPage）

- [ ] 5.1 `WorkDetailPage.tsx` の `updateCustomField` の引数型を `string | boolean` に変更
- [ ] 5.2 カスタム項目レンダリング部分で `boolean` 型の場合はチェックボックス（`<input type="checkbox">`）を表示するよう分岐追加
- [ ] 5.3 作品のカスタム項目フェッチを `api.customFields.list("work")` に変更

## 6. Frontend: 出演者詳細ページ（PerformerDetailPage）

- [ ] 6.1 `PerformerDetailPage.tsx` で出演者用カスタム項目定義を `api.customFields.list("performer")` で取得
- [ ] 6.2 カスタム項目が1件以上ある場合のみ「カスタム項目」セクションを表示
- [ ] 6.3 各カスタム項目を型に応じた入力（text/number/date/boolean）でレンダリング
- [ ] 6.4 値変更時に `api.performers.updateCustomFields` を呼び出して保存
