import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Performer, PerformerColumnKey, CustomFieldDefinition } from "@/types";

interface PerformerTableProps {
  performers: Performer[];
  visibleColumns: PerformerColumnKey[];
  customFieldDefs: CustomFieldDefinition[];
  sortBy: string;
  sortDesc: boolean;
  onSort: (key: string) => void;
}

const SORTABLE_KEYS = new Set(["name", "work_count", "avg_work_score", "total_score"]);

function formatCustomValue(value: unknown, fieldType: CustomFieldDefinition["field_type"]): string {
  if (value === null || value === undefined) return "—";
  if (fieldType === "boolean") return value ? "✓" : "—";
  if (fieldType === "date" && typeof value === "string") return value.slice(0, 10);
  return String(value);
}

export function PerformerTable({ performers, visibleColumns, customFieldDefs, sortBy, sortDesc, onSort }: PerformerTableProps) {
  const customColDefs = customFieldDefs.filter((d) =>
    visibleColumns.includes(`custom:${d.name}` as PerformerColumnKey)
  );

  const isSortable = (key: string) =>
    SORTABLE_KEYS.has(key) || (key.startsWith("custom:") && customFieldDefs.find((d) => `custom:${d.name}` === key)?.is_sortable);

  const handleHeaderClick = (key: string) => {
    if (isSortable(key)) onSort(key);
  };

  const SortableHeader = ({ colKey, label }: { colKey: string; label: string }) => {
    const sortable = isSortable(colKey);
    const active = sortBy === colKey;
    const Icon = active ? (sortDesc ? ArrowDown : ArrowUp) : ArrowUpDown;
    return (
      <th
        className={`text-left px-3 py-2 whitespace-nowrap select-none ${sortable ? "cursor-pointer hover:bg-muted/70" : ""} ${active ? "text-primary" : ""}`}
        onClick={() => handleHeaderClick(colKey)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {sortable && <Icon size={12} className={active ? "text-primary" : "text-muted-foreground"} />}
        </span>
      </th>
    );
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <SortableHeader colKey="name" label="出演者名" />
              <th className="text-left px-3 py-2 whitespace-nowrap">ふりがな</th>
              {visibleColumns.includes("work_count") && <SortableHeader colKey="work_count" label="作品数" />}
              {visibleColumns.includes("avg_work_score") && <SortableHeader colKey="avg_work_score" label="平均スコア" />}
              {visibleColumns.includes("total_score") && <SortableHeader colKey="total_score" label="合計スコア" />}
              {visibleColumns.includes("tags") && <th className="text-left px-3 py-2 whitespace-nowrap">タグ</th>}
              {customColDefs.map((d) => (
                <SortableHeader key={d.id} colKey={`custom:${d.name}`} label={d.name} />
              ))}
            </tr>
          </thead>
          <tbody>
            {performers.map((p) => (
              <tr
                key={p.id}
                className="border-t transition-colors"
              >
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <Link to={`/performers/${p.id}`} className="hover:underline text-primary hover:text-primary/80">
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{p.furigana ?? "—"}</td>
                {visibleColumns.includes("work_count") && (
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{p.work_count}</td>
                )}
                {visibleColumns.includes("avg_work_score") && (
                  <td className="px-3 py-2 font-mono text-primary whitespace-nowrap">{p.avg_work_score.toFixed(1)}</td>
                )}
                {visibleColumns.includes("total_score") && (
                  <td className="px-3 py-2 font-mono text-primary whitespace-nowrap">{p.total_score}</td>
                )}
                {visibleColumns.includes("tags") && (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <Badge key={t.id} variant="secondary" className="text-[10px] px-1 py-0 whitespace-nowrap">
                          {t.name}{t.score != null ? ` +${t.score}` : ""}
                        </Badge>
                      ))}
                    </div>
                  </td>
                )}
                {customColDefs.map((d) => (
                  <td key={d.id} className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {formatCustomValue((p.custom_fields ?? {})[d.name], d.field_type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
