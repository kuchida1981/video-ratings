## Context

作品一覧・出演者一覧のテーブルは列が固定実装されており、各列を個別の JSX として記述している。カスタム項目とタグカテゴリは動的に定義されるため、これらを列として追加するには「列定義を設定データとして扱う」アーキテクチャへの移行が必要。

既存の制約：
- `WorkListResponse` には `custom_fields` と `tags` が含まれていない（検索クエリは `work_tags` を既に joinedload 済みのため追加コストは低い）
- `PerformerResponse`（一覧 API も同じ）には `custom_fields` と `tags` が既に含まれている
- 横スクロールは許容しない

## Goals / Non-Goals

**Goals:**
- 作品一覧・出演者一覧の表示列をユーザーが選択できるようにする
- カスタム項目・タグカテゴリを列として追加できるようにする
- 列設定を localStorage に永続化する
- 横スクロールなしでレイアウトを維持する

**Non-Goals:**
- 列の並び替え（ドラッグ&ドロップなど）
- バックエンドへの列設定保存（ユーザー認証なし）
- 列ごとのソート機能の追加

## Decisions

### D1: 列定義を `ColumnDef` 配列で管理する

テーブルの列を静的 JSX から `ColumnDef[]` の宣言的データに変更する。

```typescript
interface ColumnDef<T> {
  id: string          // 例: "maker", "custom_field_3", "tag_cat_7"
  label: string       // ヘッダー表示名
  required: boolean   // true → 非表示不可
  defaultVisible: boolean
  width: string       // Tailwind クラス or CSS 幅 (例: "w-[10rem]", "w-[25%]")
  align?: "left" | "right"
  render: (item: T) => React.ReactNode
}
```

固定列（出演者・作品名など）は静的配列として定義。動的列（カスタム項目・タグカテゴリ）は `customFields` と `tagCategories` を受け取って生成する関数で定義する。

**選択しなかった案**: `react-table` などのライブラリ導入。依存追加のコストに対してメリットが小さいため自前実装とする。

---

### D2: テーブルは `table-layout: fixed` + テキスト省略

横スクロールなしでレイアウトを維持するため、`table-layout: fixed` を採用する。各列には幅の役割に応じた固定幅を割り当て、テキストがあふれた場合は `text-overflow: ellipsis` で省略する。

列幅の割り当て方針：
- `出演者` → `w-[25%]` (柔軟、必須列)
- `作品名` → `w-[75%]` を他の列が使った残りで分け合う（`width: auto`）  
  ※ 実装上は出演者・作品名以外の全列が固定幅を持ち、残りを作品名が吸収する
- `名前 (performers)` → `width: auto`（残り全幅）
- `メーカー / シリーズ / テキスト系カスタム項目` → `w-[10rem]`
- `タグカテゴリ` → `w-[12rem]`
- `スコア / 数値系カスタム項目` → `w-[5rem]`
- `登録日 / 日付系カスタム項目` → `w-[9rem]`
- `ふりがな` → `w-[9rem]`
- `出演作数` → `w-[6rem]`
- `boolean 系カスタム項目` → `w-[5rem]`

省略されたテキストは `title` 属性でホバー時にフル表示する。

---

### D3: 列設定は `useColumnConfig` カスタムフックで管理する

```typescript
function useColumnConfig(
  key: string,           // "works" | "performers"
  allColumns: ColumnDef[],
): {
  visibleIds: string[]
  toggle: (id: string) => void
}
```

- 初回は `defaultVisible: true` の列 ID を初期値とする
- localStorage キー: `column_config_works` / `column_config_performers`

---

### D4: 列設定 UI は Popover + グループ別チェックボックス

Shadcn の `Popover` コンポーネントを使う。テーブルの右上に「列を設定」ボタンを配置。ポップオーバー内は3グループ（基本列 / カスタム項目 / タグカテゴリ）に分けたチェックボックス一覧。必須列は `disabled` にして常にチェック済みとする。

---

### D5: バックエンドは `WorkListResponse` に `custom_fields` と `tags` を追加

```python
class TagInWorkList(BaseModel):
    id: int
    name: str
    category_id: int

class WorkListResponse(BaseModel):
    ...
    custom_fields: Optional[dict[str, Any]] = None
    tags: list[TagInWorkList] = []
```

`search.py` のクエリは既に `work_tags` を joinedload しているため、result ビルダーに2フィールドを追加するだけで対応できる。

## Risks / Trade-offs

- [列が多い場合に作品名列が極端に細くなる] → 必須列は常に一定幅を確保。列数が多くなるほど省略が増えるのはトレードオフとして許容する
- [localStorage の型安全性] → `z.array(z.string())` など最低限のバリデーションを行い、不正値は無視してデフォルトにフォールバックする
- [カスタム項目・タグ追加後の localStorage 陳腐化] → 保存済み ID が列定義に存在しない場合は無視する実装で対応
