import { useState, useEffect } from "react";

const STORAGE_KEY = "tileGridMaxColumns";

function getDefaultCols(): number {
  if (typeof window === "undefined") return 6;
  if (window.innerWidth < 900) return 3;
  if (window.innerWidth < 1200) return 4;
  return 6;
}

export function useTileMaxColumns() {
  const [maxCols, setMaxColsState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return isNaN(parsed) ? getDefaultCols() : Math.min(12, Math.max(2, parsed));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(maxCols));
  }, [maxCols]);

  const setMaxCols = (n: number) => {
    setMaxColsState(Math.min(12, Math.max(2, n)));
  };

  return { maxCols, setMaxCols };
}
