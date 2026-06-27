import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Performer, PerformerColumnKey, CustomFieldDefinition } from "@/types";
import { EditableCell, formatCustomValue } from "@/components/EditableCell";

interface PerformerTableProps {
  performers: Performer[];
  visibleColumns: PerformerColumnKey[];
  customFieldDefs: CustomFieldDefinition[];
  editMode?: boolean;
  onUpdateCustomField?: (performerId: number, fieldName: string, value: unknown) => Promise<void>;
}

export function PerformerTable({ performers, visibleColumns, customFieldDefs, editMode = false, onUpdateCustomField }: PerformerTableProps) {
  const customColDefs = customFieldDefs.filter((d) =>
    visibleColumns.includes(`custom:${d.name}` as PerformerColumnKey)
  );
  const searchKeywordDefs = customFieldDefs.filter((d) => d.is_search_keyword && d.field_type === "text");

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 whitespace-nowrap">出演者名</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">ふりがな</th>
              {visibleColumns.includes("work_count") && <th className="text-left px-3 py-2 whitespace-nowrap">作品数</th>}
              {visibleColumns.includes("avg_work_score") && <th className="text-left px-3 py-2 whitespace-nowrap">平均スコア</th>}
              {visibleColumns.includes("total_score") && <th className="text-left px-3 py-2 whitespace-nowrap">合計スコア</th>}
              {visibleColumns.includes("tags") && <th className="text-left px-3 py-2 whitespace-nowrap">タグ</th>}
              {customColDefs.map((d) => (
                <th key={d.id} className="text-left px-3 py-2 whitespace-nowrap">{d.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {performers.map((p) => (
              <tr
                key={p.id}
                className="border-t transition-colors"
              >
                <td className="font-medium whitespace-nowrap p-0">
                  <div className="flex items-center">
                    <Link to={`/performers/${p.id}`} className="flex-1 py-2 pl-3 pr-2 hover:underline text-primary hover:text-primary/80">
                      {p.name}
                    </Link>
                    {editMode && (
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          [
                            `"${p.name}"`,
                            ...searchKeywordDefs
                              .map((d) => String(p.custom_fields?.[d.name] ?? "").trim())
                              .filter((v) => v !== "")
                              .map((v) => `"${v}"`),
                          ].join(" ")
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 pl-2 pr-3 text-muted-foreground hover:text-primary flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Search size={14} />
                      </a>
                    )}
                  </div>
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
                {customColDefs.map((d) => {
                  const fieldValue = (p.custom_fields ?? {})[d.name];
                  return (
                    <td
                      key={d.id}
                      className="px-3 py-2 text-muted-foreground whitespace-nowrap"
                      onClick={editMode ? (e) => e.stopPropagation() : undefined}
                    >
                      {editMode ? (
                        <EditableCell
                          entityId={p.id}
                          fieldName={d.name}
                          fieldType={d.field_type}
                          initialValue={fieldValue}
                          onUpdate={onUpdateCustomField}
                        />
                      ) : (
                        formatCustomValue(fieldValue, d.field_type)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
