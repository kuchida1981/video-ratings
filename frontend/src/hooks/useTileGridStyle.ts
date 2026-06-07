import type React from "react";

export function useTileGridStyle(maxCols: number): React.CSSProperties {
  const cols = !maxCols || isNaN(maxCols) ? 6 : maxCols;
  const pct = (100 / cols).toFixed(4);
  const gapFraction = (12 * (cols - 1) / cols).toFixed(2);
  const minWidth = `max(100px, calc(${pct}% - ${gapFraction}px))`;
  return { gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` };
}
