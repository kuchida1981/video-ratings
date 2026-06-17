# CLAUDE.md — video-ratings プロジェクト

## AI ツール役割分担

このプロジェクトでは Claude Code と Antigravity CLI (agy) を役割に応じて使い分ける。

| フェーズ | ツール | 理由 |
|---------|--------|------|
| 設計・調査・探索 | **Claude Code** | 設計能力・コードベース理解が高い |
| 実装 | **Antigravity CLI** (`agy`) | Gemini クレジットを活用、Claude クレジットを節約 |
| コードレビュー・PR作成 | **Claude Code** | `/code-review` スキルを使う |

### 難易度の目安

- **低**: 既存パターンのコピー・追記、2ファイル以内、マイグレーション不要
- **中**: 複数ファイルにまたがる変更、新しいロジックの追加、スキーマ変更を伴わない
- **高**: アーキテクチャ変更、DBマイグレーション、複雑な状態管理、セキュリティ要件

難易度が高い実装や、agy が行き詰まった場合は Claude Code に切り替える。

### Claude Code から agy を呼び出す方法

実装は Claude Code から次のコマンドで agy に委譲する:

```bash
agy --dangerously-skip-permissions --print "<実装プロンプト>" 2>&1
```

プロンプトには以下を含める:
- 実装対象ファイルと変更内容（具体的に）
- 既存コードのパターン（コピーすべき書き方）
- スコープ外の制約（「この2ファイルだけ触れ」など）
- OpenSpec の change ディレクトリへの参照（`openspec/changes/<name>/` 以下）
- **実装完了後に `git add <実装ファイル> && git commit -m "feat: <変更内容>"` でコミットすること**

実装完了後は Claude Code で `git diff HEAD` または `git log` を確認してからレビューに進む。

---

## 開発ワークフロー

### 機能追加・バグ修正の標準フロー

```
1. 設計 (Claude Code)
   /opsx:explore  → 問題を探索し設計を固める
   /opsx:propose  → change proposal を生成（proposal.md / design.md / specs / tasks.md）

2. トピックブランチ作成 & proposal コミット (Claude Code)
   git checkout -b feature/<change-name>
   git add openspec/changes/<change-name>/
   git commit -m "docs(openspec): propose <change-name>"

3. 実装 (agy)
   agy --dangerously-skip-permissions --print "..." で委譲
   → agy が実装コードをコミットする（"feat: <変更内容>"）

4. コードレビュー (Claude Code)
   /code-review

5. PR 作成 & OpenSpec アーカイブ (Claude Code)
   /opsx:archive  → change をアーカイブ（delta spec sync を含む）
   gh pr create
   → アーカイブと spec sync のコミットを PR に含める

6. CI 確認 (Claude Code)
   gh pr checks --watch
   → 失敗したら是正してプッシュし、再度 watch する
```

### ドキュメント更新の原則

**設計・実装・レビューのすべての場面で常に検討すること。**

- 仕様変更・機能追加があれば `openspec/specs/` の対応する spec.md を更新する
- API の変更・新規エンドポイントがあれば関連ドキュメントに反映する
- CLAUDE.md 自体のワークフローや規約が変わったときは即座に更新する
- agy への実装プロンプトにも「関連ドキュメントの更新が必要か検討すること」を明示する

### CI / pre-commit ルール

**pre-commit のスキップ禁止**
`--no-verify` や `SKIP=...` による pre-commit フックのスキップは一切行わない。
フックが失敗した場合は、スキップせず根本原因を修正してから再コミットする。

**GitHub Actions の失敗は必ず是正する**
pre-commit が通っても GitHub Actions が失敗した場合は問題とみなす。
PR 作成後は必ず次のコマンドで CI 結果を待ち、失敗があれば修正してプッシュすること:

```bash
gh pr checks --watch   # 成功: exit 0 / 失敗: exit 非0
```

失敗した場合は `gh pr checks` でどのジョブが落ちたかを確認し、修正 → コミット → プッシュ → 再度 watch のサイクルで是正する。
CI がすべてグリーンになったことを確認してから作業完了を報告する。

### OpenSpec チートシート

| スキル | 用途 |
|--------|------|
| `/opsx:explore` | アイデア・問題を探索する（実装しない） |
| `/opsx:propose` | change proposal を一括生成 |
| `/opsx:apply` | tasks.md のタスクを順に実装（Claude Code が担当する場合） |
| `/opsx:sync` | delta spec を main spec にマージ |
| `/opsx:archive` | 完了した change をアーカイブ（PR 作成前に実施） |

### ブランチ命名規則

```
feature/<change-name>   # 機能追加（OpenSpec change 名と一致させる）
fix/<change-name>       # バグ修正
```
