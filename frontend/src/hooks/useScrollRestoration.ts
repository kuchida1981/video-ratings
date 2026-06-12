import { useEffect, useRef } from "react";

export function useScrollRestoration(key: string) {
  const restoredRef = useRef(false);

  // scrollイベントで随時保存（unmount時のcleanupに依存しない）
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const save = () => sessionStorage.setItem(key, String(main.scrollTop));
    main.addEventListener("scroll", save, { passive: true });
    return () => main.removeEventListener("scroll", save);
  }, [key]);

  // unmount時にフラグをリセット（次のマウントで復元できるように）
  useEffect(() => {
    return () => { restoredRef.current = false; };
  }, []);

  // レンダーごとに復元を試みる（コンテンツの高さが足りず失敗した場合に備えてリトライ）
  useEffect(() => {
    if (restoredRef.current) return;
    const saved = sessionStorage.getItem(key);
    if (saved === null) {
      restoredRef.current = true;
      return;
    }
    const main = document.querySelector("main");
    if (!main) return;
    const targetY = Number(saved);
    main.scrollTop = targetY;
    if (Math.abs(main.scrollTop - targetY) <= 1) {
      restoredRef.current = true;
    }
  }); // deps なし: コンテンツが描画されるまでリトライするため意図的
}
