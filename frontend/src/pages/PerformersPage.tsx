import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "@/api/client";
import type { Performer, TagCategory, CustomFieldDefinition, ColumnDef } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ColumnConfigPopover } from "@/components/ColumnConfigPopover";
import { useColumnConfig } from "@/hooks/useColumnConfig";

function buildPerformerColumns(
  customFields: CustomFieldDefinition[],
  tagCategories: TagCategory[],
): ColumnDef<Performer>[] {
  const fixed: ColumnDef<Performer>[] = [
    {
      id: "name",
      label: "名前",
      required: true,
      defaultVisible: true,
      width: "",
      render: (p) => p.name,
    },
    {
      id: "furigana",
      label: "ふりがな",
      required: false,
      defaultVisible: true,
      width: "w-[9rem]",
      render: (p) => p.furigana ?? "—",
    },
    {
      id: "work_count",
      label: "出演作数",
      required: false,
      defaultVisible: true,
      width: "w-[6rem]",
      align: "right",
      render: (p) => p.work_count,
    },
    {
      id: "total_score",
      label: "スコア",
      required: false,
      defaultVisible: true,
      width: "w-[5rem]",
      align: "right",
      render: (p) => p.total_score,
    },
  ];

  const cfCols: ColumnDef<Performer>[] = customFields
    .filter((cf) => cf.entity_type === "performer")
    .map((cf) => ({
      id: `cf_${cf.id}`,
      label: cf.name,
      required: false,
      defaultVisible: false,
      width: cf.field_type === "number" || cf.field_type === "boolean" ? "w-[5rem]" : cf.field_type === "date" ? "w-[9rem]" : "w-[10rem]",
      align: (cf.field_type === "number" ? "right" : undefined) as "right" | undefined,
      render: (p) => {
        const val = p.custom_fields?.[cf.name];
        if (val === null || val === undefined || val === "") return "—";
        if (cf.field_type === "boolean") return val ? "✓" : "✗";
        if (cf.field_type === "date") return typeof val === "string" ? new Date(val).toLocaleDateString("ja-JP") : String(val);
        return String(val);
      },
    }));

  const tagCols: ColumnDef<Performer>[] = tagCategories
    .filter((tc) => tc.entity_type === "performer")
    .map((tc) => {
      const catTagIds = new Set(tc.tags.map((t) => t.id));
      return {
        id: `tc_${tc.id}`,
        label: tc.name,
        required: false,
        defaultVisible: false,
        width: "w-[12rem]",
        render: (p) => {
          const names = p.tags.filter((t) => catTagIds.has(t.id)).map((t) => t.name);
          return names.length > 0 ? names.join(", ") : "—";
        },
      };
    });

  return [...fixed, ...cfCols, ...tagCols];
}

export default function PerformersPage() {
  const navigate = useNavigate();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");

  useEffect(() => {
    api.performers.list().then(setPerformers);
    api.tagCategories.list("performer").then(setTagCategories);
    api.customFields.list("performer").then(setCustomFields);
  }, []);

  const allColumns = useMemo(
    () => buildPerformerColumns(customFields, tagCategories),
    [customFields, tagCategories],
  );

  const { visibleIds, toggle } = useColumnConfig("performers", allColumns);

  const visibleColumns = useMemo(
    () => allColumns.filter((c) => visibleIds.includes(c.id)),
    [allColumns, visibleIds],
  );

  const columnGroups = useMemo(() => {
    const perfCustomFields = customFields.filter((cf) => cf.entity_type === "performer");
    const perfTagCategories = tagCategories.filter((tc) => tc.entity_type === "performer");
    return [
      { label: "基本列", columns: allColumns.filter((c) => !c.id.startsWith("cf_") && !c.id.startsWith("tc_")) },
      ...(perfCustomFields.length > 0 ? [{ label: "カスタム項目", columns: allColumns.filter((c) => c.id.startsWith("cf_")) }] : []),
      ...(perfTagCategories.length > 0 ? [{ label: "タグカテゴリ", columns: allColumns.filter((c) => c.id.startsWith("tc_")) }] : []),
    ];
  }, [allColumns, customFields, tagCategories]);

  const create = async () => {
    if (!name.trim()) return;
    const p = await api.performers.create({ name, furigana: furigana || undefined });
    setOpen(false);
    setName("");
    setFurigana("");
    navigate(`/performers/${p.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">出演者一覧</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus size={16} />新規登録</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>出演者を登録</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>名前 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" /></div>
              <div><Label>ふりがな</Label><Input value={furigana} onChange={(e) => setFurigana(e.target.value)} placeholder="ふりがな" /></div>
              <Button onClick={create} disabled={!name.trim()} className="w-full">登録する</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="flex justify-end px-3 py-2 border-b bg-muted/30">
          <ColumnConfigPopover groups={columnGroups} visibleIds={visibleIds} onToggle={toggle} />
        </div>
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <thead className="bg-muted/50">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className={`text-left px-4 py-2 font-medium overflow-hidden text-ellipsis whitespace-nowrap ${col.width} ${col.align === "right" ? "text-right" : ""}`}
                  title={col.label}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {performers.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-muted/30 cursor-pointer"
                onClick={() => navigate(`/performers/${p.id}`)}
              >
                {visibleColumns.map((col) => {
                  const content = col.render(p);
                  const textContent = typeof content === "string" || typeof content === "number" ? String(content) : undefined;
                  return (
                    <td
                      key={col.id}
                      className={`px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap ${col.id === "name" ? "font-medium" : "text-muted-foreground"} ${col.align === "right" ? "text-right font-mono" : ""}`}
                      title={textContent}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
            {performers.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-muted-foreground">
                  出演者が登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
