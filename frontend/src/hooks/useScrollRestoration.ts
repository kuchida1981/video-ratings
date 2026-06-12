import { useEffect, useRef } from "react";
import { useNavigationType } from "react-router-dom";

export function useScrollRestoration(key: string) {
  const restoredRef = useRef(false);
  const navigationType = useNavigationType();

  // バックナビゲーション（POP）のときのみ復元を有効にする
  // 直接遷移（PUSH/REPLACE）ではページ先頭から表示する
  useEffect(() => {
    if (navigationType !== "POP") {
      restoredRef.current = true;
    }
  }, [navigationType]);

  // scrollイベントで随時保存（150msデバウンス、復元完了前はスキップ）
  // 復元中のクランプによる 0 上書きを防ぐため restoredRef チェックを行う
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    let timeoutId: number;
    const save = () => {
      if (!restoredRef.current) return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        sessionStorage.setItem(key, String(main.scrollTop));
      }, 150);
    };
    main.addEventListener("scroll", save, { passive: true });
    return () => {
      main.removeEventListener("scroll", save);
      window.clearTimeout(timeoutId);
    };
  }, [key]);

  // Strict Mode のシミュレーテッドリマウントで ref が保持されるためクリーンアップで明示リセット
  useEffect(() => {
    return () => { restoredRef.current = false; };
  }, []);

  // レンダーごとに復元を試みる（コンテンツ高さが足りず失敗した場合のリトライ）
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
