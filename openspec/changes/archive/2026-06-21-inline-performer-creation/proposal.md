## Why

作品詳細ページで出演者を追加する際、既存の出演者リストからしか選択できない。新しい出演者を追加するにはページ遷移が必要で、作品登録の流れが中断される。作品ページ内で出演者の新規作成と紐づけを一連の操作で完結させたい。

## What Changes

- 作品詳細ページの出演者追加 `<select>` ドロップダウンに「＋ 新規出演者を作成…」という特殊な選択肢を追加する
- 選択すると Dialog が開き、名前（必須）・ふりがな（任意）を入力して出演者を作成できる
- 作成した出演者は即座に作品に紐づけられ、作品ページに留まったまま出演者一覧が更新される
- バックエンド変更なし（既存の `POST /performers` + `POST /works/{id}/performers` を順に呼ぶ）

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `performer-management`: 作品への出演者紐づけの要件に「作品詳細ページから出演者を新規作成して即座に紐づけできる」シナリオを追加

## Impact

- `frontend/src/pages/WorkDetailPage.tsx`: 出演者追加セクションに新規作成用の選択肢と Dialog を追加
