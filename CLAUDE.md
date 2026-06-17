# CLAUDE.md — video-ratings プロジェクト

## AI ツール役割分担

このプロジェクトでは Claude Code と Antigravity CLI (agy) を役割に応じて使い分ける。

| フェーズ | ツール | 理由 |
|---------|--------|------|
| 設計・調査・探索 | **Claude Code** | 設計能力・コードベース理解が高い |
| 実装（難易度: 低〜中） | **Antigravity CLI** (`agy`) | Gemini クレジットを活用、Claude クレジットを節約 |
| 実装（難易度: 高） | **Claude Code** | 複雑な判断が必要な実装は Claude Code に任せる |
| コードレビュー | **Claude Code** | `/code-review` スキルを使う |

### 難易度の目安

- **低**: 既存パターンのコピー・追記、2ファイル以内、マイグレーション不要
- **中**: 複数ファイルにまたがる変更、新しいロジックの追加、スキーマ変更を伴わない
- **高**: アーキテクチャ変更、DBマイグレーション、複雑な状態管理、セキュリティ要件

### Claude Code から agy を呼び出す方法

難易度 低〜中 の実装は、Claude Code から次のコマンドで agy に委譲する:

```bash
agy --dangerously-skip-permissions --print "<実装プロンプト>" 2>&1
```

プロンプトには以下を含める:
- 実装対象ファイルと変更内容（具体的に）
- 既存コードのパターン（コピーすべき書き方）
- スコープ外の制約（「この2ファイルだけ触れ」など）
- OpenSpec の change ディレクトリへの参照（`openspec/changes/<name>/` 以下）

実装完了後は Claude Code で `git diff HEAD` を確認してからコミット・レビューに進む。

---

## 開発ワークフロー

### 機能追加・バグ修正の標準フロー

```
1. 設計 (Claude Code)
   /opsx:explore  → 問題を探索し設計を固める
   /opsx:propose  → change proposal を生成（proposal.md / design.md / specs / tasks.md）

2. トピックブランチ作成 & proposal コミット
   git checkout -b feature/<change-name>
   git add openspec/changes/<change-name>/
   git commit -m "docs(openspec): propose <change-name>"

3. 実装 (Claude Code または agy)
   /opsx:apply    → タスクを順に実装（Claude Code）
   または agy --dangerously-skip-permissions --print "..." で委譲

4. 実装コードを同ブランチにコミット
   git add <実装ファイル>
   git commit -m "feat: <変更内容>"

5. コードレビュー (Claude Code)
   /code-review

6. PR 作成
   gh pr create
```

### OpenSpec チートシート

| スキル | 用途 |
|--------|------|
| `/opsx:explore` | アイデア・問題を探索する（実装しない） |
| `/opsx:propose` | change proposal を一括生成 |
| `/opsx:apply` | tasks.md のタスクを順に実装 |
| `/opsx:sync` | delta spec を main spec にマージ |
| `/opsx:archive` | 完了した change をアーカイブ |

### ブランチ命名規則

```
feature/<change-name>   # 機能追加（OpenSpec change 名と一致させる）
fix/<change-name>       # バグ修正
```
