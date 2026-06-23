import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SessionTimeoutOverlay() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="max-w-sm space-y-4 rounded-lg border bg-card p-6 text-center shadow-lg">
        <h2 className="text-lg font-semibold">セッションがタイムアウトしました</h2>
        <p className="text-sm text-muted-foreground">
          一定時間操作がなかったため、セッションが切れました。再度ログインしてください。
        </p>
        <Button onClick={() => navigate("/login")} className="w-full">
          ログインページへ
        </Button>
      </div>
    </div>
  );
}
