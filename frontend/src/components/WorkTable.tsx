import { useState, useEffect } from "react";
import { Files } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { WorkListItem, WorkColumnKey, CustomFieldDefinition } from "@/types";

interface WorkTableProps {
  works: WorkListItem[];
  visibleColumns: WorkColumnKey[];
  customFieldDefs: CustomFieldDefinition[];
  editMode?: boolean;
  onUpdateCustomField?: (workId: number, fieldName: string, value: unknown) => Promise<void>;
}

function formatCustomValue(value: unknown, fieldType: CustomFieldDefinition["field_type"]): string {
  if (value === null || value === undefined) return "—";
  if (fieldType === "boolean") return value ? "✓" : "—";
  if (fieldType === "date" && typeof value === "string") return value.slice(0, 10);
  return String(value);
}

interface EditableCellProps {
  workId: number;
  fieldName: string;
  fieldType: CustomFieldDefinition["field_type"];
  initialValue: unknown;
  onUpdate?: (workId: number, fieldName: string, value: unknown) => Promise<void>;
}

function getInitialStateValue(val: unknown, type: CustomFieldDefinition["field_type"]) {
  if (type === "boolean") {
    return !!val;
  }
  if (val === null || val === undefined) {
    return "";
  }
  if (type === "date" && typeof val === "string") {
    return val.slice(0, 10);
  }
  return String(val);
}

function EditableCell({
  workId,
  fieldName,
  fieldType,
  initialValue,
  onUpdate,
}: EditableCellProps) {
  const [value, setValue] = useState<string | boolean>(() =>
    getInitialStateValue(initialValue, fieldType)
  );
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setValue(getInitialStateValue(initialValue, fieldType));
    setIsError(false);
  }, [initialValue, fieldType]);

  const handleBlur = () => {
    if (fieldType === "boolean") return;

    const strValue = value as string;

    // 送信する値の決定
    let submitValue: unknown = strValue;
    if (strValue === "") {
      submitValue = null;
    } else if (fieldType === "number") {
      submitValue = Number(strValue);
    }

    // 初期値の正規化と比較
    let normInitialValue: unknown = initialValue;
    if (initialValue === null || initialValue === undefined || initialValue === "") {
      normInitialValue = null;
    } else if (fieldType === "number") {
      normInitialValue = Number(initialValue);
    } else if (fieldType === "date" && typeof initialValue === "string") {
      normInitialValue = initialValue.slice(0, 10);
    }

    if (submitValue !== normInitialValue) {
      if (onUpdate) {
        onUpdate(workId, fieldName, submitValue)
          .then(() => {
            setIsError(false);
          })
          .catch(() => {
            setIsError(true);
            setValue(getInitialStateValue(initialValue, fieldType));
          });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsError(false);
    if (fieldType === "boolean") {
      const nextVal = e.target.checked;
      setValue(nextVal);
      if (onUpdate) {
        onUpdate(workId, fieldName, nextVal)
          .then(() => {
            setIsError(false);
          })
          .catch(() => {
            setIsError(true);
            setValue(!!initialValue);
          });
      }
    } else {
      setValue(e.target.value);
    }
  };

  const inputClass = isError
    ? "w-full bg-transparent border rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring ring-2 ring-destructive"
    : "w-full bg-transparent border rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  if (fieldType === "boolean") {
    return (
      <input
        type="checkbox"
        checked={value as boolean}
        onChange={handleChange}
        className={isError ? "h-4 w-4 ring-2 ring-destructive" : "h-4 w-4"}
      />
    );
  }

  return (
    <input
      type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
      value={value as string}
      onChange={handleChange}
      onBlur={handleBlur}
      className={inputClass}
    />
  );
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
                            workId={w.id}
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
