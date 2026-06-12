## Context

カスタムフィールドの値はPostgreSQLのJSONBカラムに格納される。フロントエンドのHTML input要素（`type="number"`）でも `e.target.value` は常に文字列型を返すため、現状では数値型フィールドの値も `"9"` のような文字列としてAPIに送信される。バックエンドはそのままJSONBに保存するため、ソート時に `isinstance(v, int | float)` チェックをパスできず辞書順ソートになってしまう。

**現在のデータフロー（バグあり）:**
```
input[type=number].value = "9"  (string)
  → PATCH /works/{id}/custom-fields { "field": "9" }
  → JSONB: { "field": "9" }   ← 文字列として保存
  → sort: isinstance("9", int|float) → False → 辞書順
```

**修正後のデータフロー:**
```
input[type=number].value = "9"  (string)
  → Number("9") = 9           (number, フロントエンドで変換)
  → PATCH /works/{id}/custom-fields { "field": 9 }
  → バックエンドでもfloat("9") = 9.0に変換（二重防衛）
  → JSONB: { "field": 9 }     ← 数値として保存
  → sort: isinstance(9, int|float) → True → 数値順
```

## Goals / Non-Goals

**Goals:**
- 数値型カスタムフィールドの並べ替えが数値順で正しく動作すること
- 既存DBの文字列型数値データを数値型に変換すること
- 今後の入力が常に正しい型で保存されること（フロント＋バック二重防衛）

**Non-Goals:**
- text・date・boolean 型の型変換（これらは現状正しく動作している）
- カスタムフィールドの入力バリデーション強化（別課題）

## Decisions

### 1. フロントエンド変換：送信前に `Number()` 変換

`e.target.value` を送信前に `Number(e.target.value)` に変換する。空文字列の場合は `null` を送信する（既存の `value === "" ? null : value` パターンを踏襲）。

**WorkDetailPage.tsx の2箇所（作品フィールド・出演者フィールド）と PerformerDetailPage.tsx の1箇所を修正する。**

変換ヘルパー:
```ts
function coerceCustomFieldValue(value: string, fieldType: string): string | number | boolean | null {
  if (value === "") return null;
  if (fieldType === "number") return Number(value);
  return value;
}
```

### 2. バックエンド変換：二重防衛としてfloat変換

`update_custom_fields` でカスタムフィールド定義を参照し、`field_type === "number"` の場合は値を `float()` に変換する。フロントエンドが正しく送信しても、APIが直接呼ばれた場合に備える。

```python
def coerce_custom_field_value(value: Any, field_type: str) -> Any:
    if value is None:
        return None
    if field_type == "number":
        try:
            return float(value)
        except (ValueError, TypeError):
            return value
    return value
```

DBクエリ増加（フィールド定義のSELECT）が1回発生するが、このエンドポイントの呼び出し頻度は低く許容範囲内。

### 3. DBマイグレーション：既存データの文字列→数値変換

Alembic マイグレーション `010_coerce_numeric_custom_fields.py` を作成する。

処理手順:
1. `custom_field_definitions` から `field_type = 'number'` の全フィールド名を取得
2. 対象フィールド名ごとに、works・performers テーブルの `custom_fields` JSONB内の値を `::numeric` にキャストして更新するSQLを実行
3. 変換できない値（非数値文字列）はスキップする

```sql
UPDATE works
SET custom_fields = custom_fields || jsonb_build_object(:field_name, (custom_fields->>:field_name)::numeric)
WHERE custom_fields ? :field_name
  AND custom_fields->>:field_name ~ '^-?[0-9]+(\.[0-9]+)?$';
```

ロールバック戦略: 数値→文字列への戻しは `::text` で可能だが、精度に影響が出る可能性がある。マイグレーション前にバックアップを推奨。

## Risks / Trade-offs

- [Risk] `Number("")` は `0` を返すため、空文字列を誤って `0` として送信するリスク → 空文字列チェックを `Number()` 変換より先に行うことで回避
- [Risk] `Number("abc")` は `NaN` を返す → バックエンドの `float()` は `ValueError` を投げるためキャッチして元の値を保持
- [Risk] DBマイグレーション実行中に並行書き込みが発生すると競合する可能性 → 更新件数が少ない想定のため許容。必要であればメンテナンスモードで実行
- [Trade-off] バックエンドの `update_custom_fields` でフィールド定義DBクエリが追加されるが、ユーザー操作ごとに1回の呼び出しであり性能上の問題はない

## Open Questions

なし
