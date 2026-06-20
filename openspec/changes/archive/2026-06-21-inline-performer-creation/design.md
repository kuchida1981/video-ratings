## Context

作品詳細ページ（WorkDetailPage.tsx）では、出演者追加に `<select>` ドロップダウンを使用しており、全出演者リストから未紐づけの出演者を選択して追加する仕組みになっている。新規出演者を作成するには PerformersPage に遷移する必要がある。

バックエンドには `POST /performers`（出演者作成）と `POST /works/{id}/performers`（紐づけ）のAPIが既に存在し、追加のエンドポイントは不要。

WorkDetailPage では既に Dialog コンポーネントがインポート可能な状態（shadcn/ui を使用中）。PerformersPage の出演者作成ダイアログが参考パターンとなる。

## Goals / Non-Goals

**Goals:**
- 作品詳細ページ内で出演者の新規作成と作品への紐づけを一連の操作で完結できる
- 既存の出演者選択フローには影響を与えない

**Non-Goals:**
- `<select>` をコンボボックス（検索付きドロップダウン）に置き換えることは今回のスコープ外
- 出演者作成時にタグやカスタム項目を設定する機能の追加

## Decisions

### select の特殊オプションで Dialog を起動する

`<select>` の末尾に `<option value="__create_new__">＋ 新規出演者を作成…</option>` を追加する。この値が選択されたら Dialog を開き、`addPerformerId` の状態は空文字にリセットする。

**理由:** 既存の `<select>` UIを最小限の変更で拡張でき、ボタン追加などのレイアウト変更が不要。PerformersPage の Dialog パターンを再利用できる。

### 作成と紐づけを1つの mutation で処理する

新しい `useMutation` フックで `api.performers.create()` → `api.works.addPerformer()` を順に呼ぶ。成功時に performers と works のクエリキャッシュを両方 invalidate する。

**理由:** 2つの API 呼び出しを1つの mutation にまとめることで、ローディング状態とエラーハンドリングが簡潔になる。作成だけ成功して紐づけが失敗するケースでは、出演者は作成されるが作品には紐づかない状態になるが、その場合は通常の `<select>` から追加できるため致命的ではない。

## Risks / Trade-offs

- [出演者作成成功・紐づけ失敗] → ユーザーは通常の select から手動で追加可能。頻度は低く、許容できる
- [`<select>` のスケーラビリティ] → 出演者数が多い場合に探しにくい問題は今回のスコープ外。将来的にコンボボックス化で対応可能
