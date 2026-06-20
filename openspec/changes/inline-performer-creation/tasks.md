## 1. 出演者作成ダイアログの追加

- [ ] 1.1 WorkDetailPage に Dialog 用の state（`createPerformerOpen`, `newPerformerName`, `newPerformerFurigana`）を追加する
- [ ] 1.2 出演者作成＋作品紐づけを行う `createAndAddPerformerMutation`（`api.performers.create()` → `api.works.addPerformer()`）を追加する
- [ ] 1.3 Dialog コンポーネント（名前・ふりがな入力、「作成して追加」ボタン）を JSX に追加する

## 2. select に新規作成オプションを追加

- [ ] 2.1 `<select>` に `<option value="__create_new__">＋ 新規出演者を作成…</option>` を追加する
- [ ] 2.2 `onChange` ハンドラで `__create_new__` 選択時に Dialog を開き、`addPerformerId` を空文字にリセットするロジックを追加する
