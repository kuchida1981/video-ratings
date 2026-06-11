import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CustomFieldDefinition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FieldType = "text" | "number" | "date" | "boolean";

function SortableRow({ def, onRemove }: { def: CustomFieldDefinition; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: def.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  const typeLabel = (t: string) =>
    ({ text: "テキスト", number: "数値", date: "日付", boolean: "チェックボックス" }[t] ?? t);

  return (
    <tr ref={setNodeRef} style={style} className="border-t bg-background">
      <td className="px-2 py-2 w-6">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical size={16} />
        </div>
      </td>
      <td className="px-4 py-2">{def.name}</td>
      <td className="px-4 py-2 text-muted-foreground">{typeLabel(def.field_type)}</td>
      <td className="px-4 py-2 text-right">
        <button className="text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function CustomFieldsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [entityType, setEntityType] = useState<"work" | "performer">("work");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { data: workDefs = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["customFields", "work"],
    queryFn: () => api.customFields.list("work"),
  });

  const { data: performerDefs = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["customFields", "performer"],
    queryFn: () => api.customFields.list("performer"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["customFields"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.customFields.create>[0]) => api.customFields.create(data),
    onSuccess: () => { setName(""); invalidate(); },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.customFields.delete(id),
    onSuccess: () => invalidate(),
  });

  const handleDragEnd = (event: DragEndEvent, entityTypeScope: "work" | "performer") => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const key = ["customFields", entityTypeScope] as const;
    queryClient.setQueryData<CustomFieldDefinition[]>(key, (prev = []) => {
      const oldIndex = prev.findIndex((d) => d.id === active.id);
      const newIndex = prev.findIndex((d) => d.id === over.id);
      const moved = arrayMove(prev, oldIndex, newIndex);
      api.customFields.reorder(moved.map((d) => d.id)).catch(() => invalidate());
      return moved;
    });
  };

  const renderTable = (defs: CustomFieldDefinition[], emptyMsg: string, entityTypeScope: "work" | "performer") => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => handleDragEnd(e, entityTypeScope)}
    >
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-2 w-6"></th>
              <th className="text-left px-4 py-2 font-medium">項目名</th>
              <th className="text-left px-4 py-2 font-medium">型</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <SortableContext items={defs.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {defs.map((d) => (
                <SortableRow
                  key={d.id}
                  def={d}
                  onRemove={() => {
                    const target = d.entity_type === "performer" ? "全出演者" : "全作品";
                    if (confirm(`「${d.name}」を削除すると${target}からこの項目の値も削除されます。続けますか？`)) {
                      removeMutation.mutate(d.id);
                    }
                  }}
                />
              ))}
            </SortableContext>
            {defs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{emptyMsg}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DndContext>
  );

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-bold">設定 — カスタム項目</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">作品用カスタム項目</h2>
        {renderTable(workDefs, "作品用カスタム項目がありません", "work")}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">出演者用カスタム項目</h2>
        {renderTable(performerDefs, "出演者用カスタム項目がありません", "performer")}
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
        <Button onClick={() => { if (!name.trim()) return; createMutation.mutate({ name, field_type: fieldType, entity_type: entityType }); }} disabled={!name.trim()}><Plus size={16} />追加</Button>
      </div>
    </div>
  );
}
