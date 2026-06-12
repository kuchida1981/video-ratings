## 1. フロントエンド修正

- [x] 1.1 `WorkDetailPage.tsx` の作品用カスタムフィールド `onBlur` ハンドラで、`field_type === "number"` の場合に `Number(e.target.value)` に変換してから送信する（空文字列は null）
- [x] 1.2 `WorkDetailPage.tsx` の出演者用カスタムフィールド `onBlur` ハンドラに同様の変換を適用する
- [x] 1.3 `PerformerDetailPage.tsx` の出演者用カスタムフィールド `onBlur` ハンドラに同様の変換を適用する

## 2. バックエンド修正

- [x] 2.1 `backend/app/routers/works.py` の `update_custom_fields` で、カスタムフィールド定義を参照して `field_type === "number"` の値を `float()` に変換するロジックを追加する
- [x] 2.2 `backend/app/routers/performers.py` の `update_custom_fields` に同様のロジックを追加する

## 3. DBマイグレーション

- [x] 3.1 `backend/alembic/versions/010_coerce_numeric_custom_fields.py` を作成する
- [x] 3.2 マイグレーションの `upgrade()` に、`custom_field_definitions` から number 型フィールド名を取得し、works・performers の JSONB内の対応する文字列値を `::numeric` にキャストするSQLを実装する（数値パターン `^-?[0-9]+(\.[0-9]+)?$` にマッチする値のみ変換）
- [x] 3.3 マイグレーションの `downgrade()` に、数値→文字列の逆変換SQLを実装する
- [x] 3.4 `docker compose exec backend alembic upgrade head` でマイグレーションを適用する

## 4. 動作確認

- [ ] 4.1 数値型カスタムフィールドで並べ替えると 9 < 14 < 15 の正しい数値順になることを確認する（ユーザーによるUI確認）
