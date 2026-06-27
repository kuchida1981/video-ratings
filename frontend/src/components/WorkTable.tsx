import { Files, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { WorkListItem, WorkColumnKey, CustomFieldDefinition } from "@/types";
import { EditableCell, formatCustomValue } from "@/components/EditableCell";

interface WorkTableProps {
  works: WorkListItem[];
  visibleColumns: WorkColumnKey[];
  customFieldDefs: CustomFieldDefinition[];
  editMode?: boolean;
  onUpdateCustomField?: (workId: number, fieldName: string, value: unknown) => Promise<void>;
}


export function WorkTable({
  works,
  visibleColumns,
  customFieldDefs,
  editMode = false,
  onUpdateCustomField,
}: WorkTableProps) {
  const customColDefs = customFieldDefs.filter((d) =>
    visibleColumns.includes(`custom:${d.name}` as WorkColumnKey)
  );
  const searchKeywordDefs = customFieldDefs.filter((d) => d.is_search_keyword && d.field_type === "text");

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
                    <div className="flex items-center">
                      <Link to={`/works/${w.id}`} className="flex-1 min-w-0 py-2 pl-3 pr-2 line-clamp-2 hover:underline text-primary hover:text-primary/80">
                        {w.title}
                      </Link>
                      {editMode && (
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            [
                              ...w.performers.map((p) => `"${p.name}"`),
                              `"${w.title}"`,
                              ...searchKeywordDefs
                                .map((d) => String(w.custom_fields?.[d.name] ?? "").trim())
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
                  {customColDefs.map((d) => {
                    const fieldValue = (w.custom_fields ?? {})[d.name];
                    return (
                      <td
                        key={d.id}
                        className="px-3 py-2 text-muted-foreground whitespace-nowrap"
                        onClick={editMode ? (e) => e.stopPropagation() : undefined}
                      >
                        {editMode ? (
                          <EditableCell
                            entityId={w.id}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
