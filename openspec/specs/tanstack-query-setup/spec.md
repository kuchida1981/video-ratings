## ADDED Requirements

### Requirement: QueryClient をアプリ全体で利用可能にする
アプリケーションは `@tanstack/react-query` の `QueryClient` を初期化し、`QueryClientProvider` でコンポーネントツリー全体をラップしなければならない。

#### Scenario: アプリ起動時に QueryClient が利用可能になる
- **WHEN** アプリケーションが起動する
- **THEN** すべてのコンポーネントから `useQuery` / `useMutation` / `useQueryClient` が使用可能である

#### Scenario: refetchOnWindowFocus の設定
- **WHEN** QueryClient を初期化する
- **THEN** `refetchOnWindowFocus: false` がデフォルト設定として適用される（ローカルアプリでウィンドウフォーカス時の自動再フェッチは不要）
