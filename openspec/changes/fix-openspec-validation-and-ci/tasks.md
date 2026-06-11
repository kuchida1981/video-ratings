## 1. パターンA: ## Purpose / ## Requirements ヘッダー追加 (5件)

- [ ] 1.1 `ci-pipeline` spec に `## Purpose` / `## Requirements` ヘッダーを追加する
- [ ] 1.2 `import-flow-hook` spec に `## Purpose` / `## Requirements` ヘッダーを追加する
- [ ] 1.3 `performers-data-fetching` spec に `## Purpose` / `## Requirements` ヘッダーを追加する
- [ ] 1.4 `tanstack-query-setup` spec に `## Purpose` / `## Requirements` ヘッダーを追加する
- [ ] 1.5 `works-data-fetching` spec に `## Purpose` / `## Requirements` ヘッダーを追加する

## 2. パターンB: SHALL キーワード追記 (22件)

- [ ] 2.1 `cover-image-management` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.2 `cover-service` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.3 `custom-field-sort-order` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.4 `data-export-import` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.5 `filter-state-persistence` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.6 `google-search-links` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.7 `performer-aliases` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.8 `performer-management` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.9 `performer-memo` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.10 `performer-service` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.11 `performer-work-tiles` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.12 `performers-list-work-count` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.13 `tag-category-editing` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.14 `tag-descriptions` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.15 `tag-evaluation` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.16 `tag-sort-order` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.17 `tile-grid-view` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.18 `work-management` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.19 `work-memo` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.20 `work-page-performer-rating` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.21 `work-service` の各 Requirement に `（SHALL）` を追記する
- [ ] 2.22 `works-list-display` の各 Requirement に `（SHALL）` を追記する

## 3. パターンC: 空の Requirements セクション補完 (1件)

- [ ] 3.1 `list-column-config` の `## Requirements` セクションに要件を追加する

## 4. バリデーション確認

- [ ] 4.1 `openspec validate --strict --all` を実行して 38/38 pass を確認する

## 5. pre-commit hook の追加

- [ ] 5.1 `.pre-commit-config.yaml` に `openspec-validate` hook を追加する（`files: ^openspec/`）

## 6. GitHub Actions ジョブの追加

- [ ] 6.1 `.github/workflows/ci.yml` の `changes` ジョブに `openspec` パスフィルターを追加する
- [ ] 6.2 `.github/workflows/ci.yml` に `validate-docs` ジョブを追加する
