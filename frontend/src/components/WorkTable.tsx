import { Files } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { WorkListItem, WorkColumnKey, CustomFieldDefinition } from "@/types";

interface WorkTableProps {
  works: WorkListItem[];
  visibleColumns: WorkColumnKey[];
  customFieldDefs: CustomFieldDefinition[];
}

function formatCustomValue(value: unknown, fieldType: CustomFieldDefinition["field_type"]): string {
  if (value === null || value === undefined) return "—";
  if (fieldType === "boolean") return value ? "✓" : "—";
  if (fieldType === "date" && typeof value === "string") return value.slice(0, 10);
  return String(value);
}

export function WorkTable({ works, visibleColumns, customFieldDefs }: WorkTableProps) {
  const customColDefs = customFieldDefs.filter((d) =>
    visibleColumns.includes(`custom:${d.name}` as WorkColumnKey)
  );

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 whitespace-nowrap">タイトル</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">出演者</th>

              {visibleColumns.includes("total_score") && <th className="text-left px-3 py-2 whitespace-nowrap">スコア</th>}
              {visibleColumns.includes("tags") && <th className="text-left px-3 py-2 whitespace-nowrap">タグ</th>}
              {visibleColumns.includes("file_count") && <th className="text-left px-3 py-2 whitespace-nowrap">ファイル数</th>}
              {visibleColumns.includes("created_at") && <th className="text-left px-3 py-2 whitespace-nowrap">登録日</th>}
              {customColDefs.map((d) => (
                <th key={d.id} className="text-left px-3 py-2 whitespace-nowrap">{d.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {works.map((w) => {
              const performers = w.performers.map((p) => p.name).join(", ") || "—";
              return (
                <tr
                  key={w.id}
                  className="border-t transition-colors"
                >
                  <td className="font-medium max-w-xs p-0">
                    <Link to={`/works/${w.id}`} className="block px-3 py-2 line-clamp-2 hover:underline text-primary hover:text-primary/80">
                      {w.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground max-w-xs">
                    <span className="line-clamp-1">{performers}</span>
                  </td>

                  {visibleColumns.includes("total_score") && (
                    <td className="px-3 py-2 font-mono text-primary whitespace-nowrap">{w.total_score}</td>
                  )}
                  {visibleColumns.includes("tags") && (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {w.tags.map((t) => (
                          <Badge key={t.id} variant="secondary" className="text-[10px] px-1 py-0 whitespace-nowrap">
                            {t.name}{t.score != null ? ` +${t.score}` : ""}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("file_count") && (
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {w.file_count > 0 ? (
                        <span className="inline-flex items-center gap-1"><Files size={12} />{w.file_count}</span>
                      ) : "—"}
                    </td>
                  )}
                  {visibleColumns.includes("created_at") && (
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{w.created_at.slice(0, 10)}</td>
                  )}
                  {customColDefs.map((d) => (
                    <td key={d.id} className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {formatCustomValue((w.custom_fields ?? {})[d.name], d.field_type)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
