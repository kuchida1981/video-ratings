## Why

作品一覧で各作品にファイルパスが何件登録されているか確認できず、ファイル未設定の作品を特定しにくい。タイルにファイル数を表示し「ファイルなし」フィルタを追加することで、整備状況を素早く把握できるようにする。

## What Changes

- 作品一覧APIレスポンス（`WorkListResponse`）に `file_count` フィールドを追加
- 作品タイルの下部にファイル数バッジを表示（1件以上の場合のみ、0件は非表示）
- フィルタエリアに「ファイルなし」バッジを追加（クライアントサイドフィルタ）

## Capabilities

### New Capabilities

- `work-file-count-display`: 作品一覧タイルにファイル数を表示し、ファイル未設定の作品をフィルタリングする機能

### Modified Capabilities

（なし）

## Impact

- **Backend**: `backend/app/schemas/work.py`、`backend/app/routers/works.py`
- **Frontend**: `frontend/src/types/index.ts`、`frontend/src/components/WorkTile.tsx`、`frontend/src/pages/WorksPage.tsx`
- **API**: `GET /works` レスポンスに `file_count: int` を追加（追加のみ、破壊的変更なし）
