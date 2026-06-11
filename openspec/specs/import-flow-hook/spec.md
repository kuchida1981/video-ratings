## Purpose

WorksPage のバルクインポートフロー状態を `useImportFlow` カスタムフックにカプセル化する仕様。インポート固有の状態・ハンドラーをコンポーネントから分離する。

## Requirements

### Requirement: インポートフロー状態を useImportFlow フックにカプセル化する
WorksPage のバルクインポートに関連する状態（importPhase, confirmRowNumbers, importPreview, importRowStates, importResult, importLoading, importDragOver）とそのハンドラーは `useImportFlow` カスタムフックに切り出されなければならない（SHALL）。

#### Scenario: WorksPage がフックを通じてインポート状態を利用する
- **WHEN** WorksPage がレンダリングされる
- **THEN** インポートUIに必要な状態とハンドラーは `useImportFlow()` の戻り値から取得される

#### Scenario: インポートフローの動作が変わらない
- **WHEN** ユーザーがファイルをアップロードしてインポートを実行する
- **THEN** アップロード → プレビュー → 確認 → 結果 のフェーズ遷移が従来通り動作する

### Requirement: フックはインポートフロー固有の関心事のみを持つ
`useImportFlow` フックは works 一覧の状態や fetchWorks などインポート以外の関心事を持ってはならない（SHALL NOT）。インポート完了後のリスト更新は、フックの外（WorksPage 側）で queryClient.invalidateQueries を通じて行う。

#### Scenario: インポート完了後に works 一覧が更新される
- **WHEN** インポートが正常に完了する
- **THEN** `useImportFlow` はコールバック（onImportComplete 等）を通じて呼び出し元に完了を通知し、works 一覧の再フェッチは WorksPage 側が責任を持つ
