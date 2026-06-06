import { useState, useCallback } from "react";
import type { ColumnDef } from "@/types";

function loadFromStorage(key: string, defaultIds: string[]): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultIds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultIds;
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return defaultIds;
  }
}

export function useColumnConfig<T>(
  storageKey: string,
  allColumns: ColumnDef<T>[],
): {
  visibleIds: string[];
  toggle: (id: string) => void;
} {
  const defaultIds = allColumns.filter((c) => c.defaultVisible).map((c) => c.id);
  const fullKey = `column_config_${storageKey}`;

  const [visibleIds, setVisibleIds] = useState<string[]>(() =>
    loadFromStorage(fullKey, defaultIds)
  );

  const toggle = useCallback(
    (id: string) => {
      const col = allColumns.find((c) => c.id === id);
      if (!col || col.required) return;
      setVisibleIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        try {
          localStorage.setItem(fullKey, JSON.stringify(next));
        } catch {
          // ignore storage errors
        }
        return next;
      });
    },
    [allColumns, fullKey],
  );

  return { visibleIds, toggle };
}
