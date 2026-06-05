import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import type { CustomFieldDefinition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FieldType = "text" | "number" | "date" | "boolean";

export default function CustomFieldsPage() {
  const [workDefs, setWorkDefs] = useState<CustomFieldDefinition[]>([]);
  const [performerDefs, setPerformerDefs] = useState<CustomFieldDefinition[]>([]);
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [entityType, setEntityType] = useState<"work" | "performer">("work");

  const reload = () => {
    api.customFields.list("work").then(setWorkDefs);
    api.customFields.list("performer").then(setPerformerDefs);
  };
  useEffect(() => { reload(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    await api.customFields.create({ name, field_type: fieldType, entity_type: entityType });
    setName("");
    reload();
  };

  const remove = async (id: number, defName: string, defEntityType: string) => {
    const target = defEntityType === "performer" ? "全出演者" : "全作品";
    if (!confirm(`「${defName}」を削除すると${target}からこの項目の値も削除されます。続けますか？`)) return;
    await api.customFields.delete(id);
    reload();
  };

  const typeLabel = (t: string) =>
    ({ text: "テキスト", number: "数値", date: "日付", boolean: "チェックボックス" }[t] ?? t);

  const renderTable = (defs: CustomFieldDefinition[], emptyMsg: string) => (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-2 font-medium">項目名</th>
            <th className="text-left px-4 py-2 font-medium">型</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {defs.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-4 py-2">{d.name}</td>
              <td className="px-4 py-2 text-muted-foreground">{typeLabel(d.field_type)}</td>
              <td className="px-4 py-2 text-right">
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(d.id, d.name, d.entity_type)}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {defs.length === 0 && (
            <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">{emptyMsg}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-bold">設定 — カスタム項目</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">作品用カスタム項目</h2>
        {renderTable(workDefs, "作品用カスタム項目がありません")}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">出演者用カスタム項目</h2>
        {renderTable(performerDefs, "出演者用カスタム項目がありません")}
      </section>

      <div className="space-y-3 border rounded-lg p-4">
        <h2 className="font-semibold text-sm">項目を追加</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs">項目名</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 発売日" />
          </div>
          <div className="w-36">
            <Label className="text-xs">対象</Label>
            <Select value={entityType} onValueChange={(v) => setEntityType(v as "work" | "performer")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="work">作品</SelectItem>
                <SelectItem value="performer">出演者</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Label className="text-xs">型</Label>
            <Select value={fieldType} onValueChange={(v) => setFieldType(v as FieldType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">テキスト</SelectItem>
                <SelectItem value="number">数値</SelectItem>
                <SelectItem value="date">日付</SelectItem>
                <SelectItem value="boolean">チェックボックス</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={create} disabled={!name.trim()}><Plus size={16} />追加</Button>
      </div>
    </div>
  );
}
