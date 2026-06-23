export default function SessionTimeoutOverlay({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8 text-center shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">セッションがタイムアウトしました</h2>
        <p className="text-sm text-muted-foreground">
          一定時間操作がなかったため、セッションが切れました。
        </p>
        <button
          onClick={onLogin}
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          ログインページへ
        </button>
      </div>
    </div>
  );
}
