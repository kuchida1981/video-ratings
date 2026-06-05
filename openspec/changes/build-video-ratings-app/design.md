## Context

個人所有の映像ソフトを管理するWebアプリの新規構築。Ubuntu 24.04のローカルネットワーク上にホスティングし、単一ユーザーが使用する。ファイルはSambaネットワーク共有が中心。認証・権限管理は不要。

## Goals / Non-Goals

**Goals:**
- 作品・出演者・タグの CRUD および CSV一括インポート
- タグベースのスコアリング（作品 + 主演出演者）
- カスタム項目の定義と検索
- Docker Compose による再現可能な開発・デプロイ環境

**Non-Goals:**
- 認証・マルチユーザー対応
- 動画再生機能（将来の拡張として設計上考慮するが、初版では実装しない）
- 外部メタデータサービス（IMDb等）との連携
- モバイルアプリ

## Decisions

### 1. Backend: FastAPI (Python) vs Go

**決定**: FastAPI (Python 3.12+) を採用

**理由**:
- CSV インポートが標準ライブラリで自然に扱える
- SQLAlchemy の JSONB サポートが充実しており、カスタム項目の実装が簡潔
- 個人プロジェクトとして開発速度を優先

**代替案**: Go（単一バイナリのデプロイ、パフォーマンス優位）— 将来的な移行は排除しないが初版では不採用

---

### 2. Database: PostgreSQL vs SQLite

**決定**: PostgreSQL 16 を採用

**理由**:
- `JSONB` + `GIN index` によるカスタム項目の検索が必要
- `tsvector` による日本語全文検索の将来拡張が可能
- Ubuntu 24.04 での本番運用に適している

**代替案**: SQLite（シンプルだが JSONB の GIN index が使えない）

---

### 3. カスタム項目の保存: JSONB vs EAV

**決定**: `works.custom_fields JSONB` + `custom_field_definitions` テーブルの組み合わせ

```
custom_field_definitions   works
  id                         id
  name                       title
  field_type (text|           ...
             number|          custom_fields: {
             date)              "release_year": 2022,
                                "label": "限定版"
                              }
```

**理由**:
- スキーマがシンプルで JOIN が不要
- GIN index により `custom_fields @> '{"release_year": 2022}'` のような検索が可能
- `custom_field_definitions` で UI がフィールド一覧を把握できる

**代替案**: EAV テーブル（型安全だが検索クエリが複雑になる）

---

### 4. ファイルパス形式: SMB URL

**決定**: `smb://server/share/path/file.ext` を標準形式として採用

**理由**:
- プロトコルを明示することで将来の再生機能実装時に判別が容易
- ローカルパスも `file:///path/to/file.ext` 形式に統一可能

**現状**: 実際のファイルは `/mnt/nas/...` にマウントされていることが多いが、DB 上は SMB URL で保持する。表示・再生時に変換テーブルや設定でマッピングする。

---

### 5. スコア計算: 分離・交換可能な設計

**決定**: スコア計算ロジックをサービス層に分離し、データモデルに埋め込まない

```python
class ScoreCalculator:
    def calculate_work_score(self, work: Work) -> int:
        work_score = sum(t.score or 0 for t in work.tags)
        performer_score = self._main_performer_score(work)
        return work_score + performer_score

    def _main_performer_score(self, work: Work) -> int:
        main = next((wp.performer for wp in work.work_performers if wp.is_main), None)
        return sum(t.score or 0 for t in main.tags) if main else 0
```

**理由**: 「評価方法は後から見直したくなる可能性が高い」というユーザー要件に対応。ロジックを1箇所に集約することで変更コストを最小化する。

---

### 6. タグカテゴリ: entity_type による分離

**決定**: `tag_categories` テーブルに `entity_type ENUM('work', 'performer')` カラムを設け、単一テーブルで管理しつつ論理的に分離

**理由**: 同じ CRUD パターンを再利用しつつ、作品用・出演者用で混在しない UI フィルタリングが容易

---

### 7. Frontend: React + TypeScript + Vite + shadcn/ui

**決定**: React 18 + TypeScript + Vite + shadcn/ui を採用

**理由**:
- データテーブル、フィルタ、フォームなど必要な UI コンポーネントが揃っている
- TypeScript によりバックエンドの型定義を共有しやすい

**代替案**: Vue 3（軽量だがコンポーネントライブラリの選択肢が少ない）、HTMX（JS 最小化できるがインタラクティブな検索 UI が複雑になる）

---

### 8. Docker Compose 構成

```yaml
services:
  db:        # PostgreSQL 16
  backend:   # FastAPI (uvicorn, hot reload)
  frontend:  # Vite dev server (HMR)
```

本番環境は `nginx` + `gunicorn` を追加したcompose overrideで対応する想定。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| PostgreSQL JSONB のカスタム項目検索は型推論がない | `field_type` を `custom_field_definitions` で管理し、クエリ生成時に型キャストを適用する |
| SMB URL 形式は再生時にブラウザ非対応 | 再生機能実装時にサーバーサイドプロキシ or VLC deeplink で対応。初版は再生なし |
| 出演者スコアの計算方式変更が将来発生 | `ScoreCalculator` を DI 可能なサービスとして設計し、変更箇所を局所化 |
| CSV インポートで出演者名とふりがなの対応ズレ | インポート時に行単位でバリデーション結果をプレビュー表示してから確定する |

## Open Questions

- 将来の動画再生機能で SMB パスからストリーミングする際、サーバー側マウントとクライアント側マウントのどちらを使うか（初版では未決定）
- カスタム項目の `number` 型は整数のみか、小数も許容するか
