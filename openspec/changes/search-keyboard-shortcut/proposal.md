# Proposal: search-keyboard-shortcut

## Summary

作品一覧ページで "/" キーを押すと検索フォームにフォーカスが移るキーボードショートカットを追加する。

## Motivation

キーボード操作で素早く検索に移れるようにしたい。GitHub や YouTube など多くの Web アプリで採用されている標準的な UX パターン。

## Scope

- **対象**: WorksPage の検索 `<Input>`
- **トリガー**: "/" キー押下
- **ガード**: `<input>`, `<textarea>`, `[contenteditable]` にフォーカスがあるときは無視（入力中の "/" を奪わない）
- **対象外**: PerformersPage（キーワード検索がないため）

## Difficulty

低 — 1 ファイルの変更、`useRef` + `useEffect` 追加のみ
