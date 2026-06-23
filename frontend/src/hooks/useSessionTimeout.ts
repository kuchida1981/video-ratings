import { useEffect, useRef, useCallback } from "react";

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

export function useSessionTimeout(onTimeout: () => void) {
  const lastActivity = useRef(Date.now());

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    const events = ["click", "keydown", "scroll", "mousemove"] as const;
    events.forEach((e) => window.addEventListener(e, resetActivity, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetActivity));
    };
  }, [resetActivity]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (Date.now() - lastActivity.current < SESSION_TIMEOUT_MS) return;

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) {
          onTimeout();
        } else {
          lastActivity.current = Date.now();
        }
      } catch {
        // ネットワークエラーはセッション切れとみなさない
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [onTimeout]);
}
