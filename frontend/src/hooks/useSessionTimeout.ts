import { useEffect, useRef } from "react";

const TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds

export function useSessionTimeout(onTimeout: () => void) {
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["click", "keydown", "scroll", "mousemove"];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    const interval = setInterval(async () => {
      if (Date.now() - lastActivityRef.current > TIMEOUT_MS) {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (res.status === 401) {
            onTimeout();
          }
        } catch {
          onTimeout();
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [onTimeout]);
}
