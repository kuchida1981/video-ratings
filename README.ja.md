# Video Ratings

個人所有の映像ソフトをカタログ化・評価・検索するための Web アプリケーション。タグベースのスコアリングシステムと出演者評価を組み合わせ、自分の好みに合わせた評価軸でコレクションを管理できる。

[English version is available here](README.md)


## 機能

- **作品管理** — 個別登録・CSV インポート・編集・削除。SMB URL 形式のファイルパスを複数管理可能
- **出演者管理** — 出演者（名前・ふりがな）の管理と作品への紐づけ（主演フラグあり）
- **タグ評価** — タグカテゴリとタグによるスコアリング。作品スコアと主演出演者スコアの合算で総合評価を算出
- **カスタム項目** — テキスト・数値・日付・チェックボックス型のユーザー定義項目を作品・出演者に付与
- **表示のカスタマイズ** — 作品・出演者一覧の表示列を選択・並び替え。カスタム項目やタグカテゴリも表示可能
- **検索・フィルタ** — 作品名・出演者名・ふりがな・タグ・メーカー・シリーズ・カスタム項目での絞り込み
- **外部連携** — 出演者名や作品名から Google 検索を素早く実行できるリンクを提供
- **データ管理** — データベース全件の JSON エクスポート・インポートによるバックアップ機能を搭載

## スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| バックエンド | Python 3.12, FastAPI, SQLAlchemy 2, Alembic |
| データベース | PostgreSQL 16 |
| インフラ | Docker Compose |

---

## ユーザーガイド

### 基本的な使い方

#### 作品を登録する

1. サイドバーの **作品** から作品一覧へ移動
2. **新規登録** ボタンをクリック
3. 作品名（必須）・メーカー・シリーズ・出演者・ファイルパスを入力して保存

#### 表示列をカスタマイズする

1. 一覧ページ（作品/出演者）の右上にある **列設定** アイコンをクリック
2. 表示したい列にチェックを入れる。カスタム項目やタグカテゴリも選択可能
3. 設定はブラウザに保存される

#### CSV から一括インポートする

サイドバーの **インポート** ページから、以下の列を持つ CSV ファイルをアップロード可能（`performer_furiganas` と `directory_path` は省略可）:

```
title,performer_names,performer_furiganas,directory_path
作品A,山田太郎,やまだたろう,smb://nas/share/a
作品B,山田太郎 鈴木花子,やまだたろう すずきはなこ,
```

- `performer_names` / `performer_furiganas` は複数名をスペース区切りで記述
- インポート前にプレビューでバリデーション結果を確認できる

#### タグでスコアを付ける

1. **タグ管理** ページでタグカテゴリを作成（対象: 作品 or 出演者、複数選択の可否を設定）
2. カテゴリ内にタグを追加（スコアは整数、省略するとラベル専用タグになる）
3. 作品詳細または出演者詳細からタグを選択

**スコア計算式:**

```
作品の合計スコア = Σ(作品タグのスコア) + 主演出演者の合計スコア
```

スコアなし（null）のタグは 0 として扱われる。出演者タグのスコアは主演設定されている作品にのみ反映される。

#### バックアップと復元

1. **設定** ページの「データ管理」セクションから **エクスポート** をクリックして JSON ファイルを保存
2. 復元時は同じセクションで **インポート** をクリックして JSON ファイルを選択
3. **注意:** インポートを実行すると、現在のデータベースの内容はすべて上書き（削除）される

---

## 開発者ガイド

### 前提条件

- Docker & Docker Compose
- （ローカル開発のみ）Python 3.12+、Node.js 20+

### セットアップ

```bash
git clone <repository-url>
cd video-ratings
docker compose up -d
```

起動後のアクセス先:

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:5173 |
| バックエンド API | http://localhost:8000 |
| API ドキュメント | http://localhost:8000/docs (`DEBUG=true` が必要) |
| PostgreSQL | localhost:5433 |

### ディレクトリ構成

```
video-ratings/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI アプリケーション
│   │   ├── models/          # SQLAlchemy モデル
│   │   ├── routers/         # APIルーター (works, performers, tags, ...)
│   │   ├── schemas/         # Pydantic スキーマ
│   │   └── services/        # ビジネスロジック (スコア計算等)
│   └── alembic/             # DBマイグレーション
├── frontend/
│   └── src/
│       ├── pages/           # ページコンポーネント
│       ├── components/ui/   # shadcn/ui コンポーネント
│       ├── api/             # API クライアント
│       └── types/           # TypeScript 型定義
└── docker-compose.yml
```

### 環境変数

`backend/.env.example` を参考に `backend/.env` を作成する（Docker Compose 使用時は不要）:

```
DATABASE_URL=postgresql://video_ratings:video_ratings@localhost:5432/video_ratings
```

### マイグレーション

```bash
# コンテナ内で実行
docker compose exec backend alembic upgrade head

# 新しいマイグレーションを作成
docker compose exec backend alembic revision --autogenerate -m "description"
```

### ローカル開発（Docker なし）

**バックエンド:**

```bash
cd backend
pip install -e .
DATABASE_URL=postgresql://... uvicorn app.main:app --reload
```

**フロントエンド:**

```bash
cd frontend
npm install
npm run dev
```
