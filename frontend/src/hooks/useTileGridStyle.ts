export function useTileGridStyle(maxCols: number): React.CSSProperties {
  const pct = (100 / maxCols).toFixed(4);
  const gapFraction = (12 * (maxCols - 1) / maxCols).toFixed(2);
  const minWidth = `max(100px, calc(${pct}% - ${gapFraction}px))`;
  return { gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` };
}

import type React from "react";
