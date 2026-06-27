import { useState, useRef } from "react";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { Plus, Trash2, GripVertical, Download, Upload } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/contexts/AuthContext";

type FieldType = "text" | "number" | "date" | "boolean";

function SortableRow({
  def,
  onRemove,
  onToggleSortable,
  onToggleSearchKeyword,
  isEditor,
}: {
  def: CustomFieldDefinition;
  onRemove: () => void;
  onToggleSortable: (checked: boolean) => void;
  onToggleSearchKeyword: (checked: boolean) => void;
  isEditor: boolean;
}) {
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
      {isEditor && (
        <td className="px-2 py-2 w-6">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical size={16} />
          </div>
        </td>
      )}
      <td className="px-4 py-2">{def.name}</td>
      <td className="px-4 py-2 text-muted-foreground">{typeLabel(def.field_type)}</td>
      <td className="px-4 py-2 text-center">
        <Switch checked={def.is_sortable} onCheckedChange={onToggleSortable} disabled={!isEditor} />
      </td>
      <td className="px-4 py-2 text-center">
        <Switch
          checked={def.is_search_keyword}
          onCheckedChange={onToggleSearchKeyword}
          disabled={!isEditor || def.field_type !== "text"}
        />
      </td>
      {isEditor && (
        <td className="px-4 py-2 text-right">
          <button className="text-muted-foreground hover:text-destructive" onClick={onRemove}>
            <Trash2 size={14} />
          </button>
        </td>
      )}
    </tr>
  );
}

export default function SettingsPage() {
  const { maxCols, setMaxCols } = useTileMaxColumns();
  const queryClient = useQueryClient();
  const { isEditor } = useAuth();
  useDocumentTitle("設定");
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [entityType, setEntityType] = useState<"work" | "performer">("work");

  const [exportLoading, setExportLoading] = useState(false);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { is_sortable?: boolean; is_search_keyword?: boolean } }) =>
      api.customFields.update(id, data),
    onSuccess: () => invalidate(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.customFields.delete(id),
    onSuccess: () => invalidate(),
  });

  const handleDragEnd = (event: DragEndEvent, entityTypeScope: "work" | "performer") => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const key = ["customFields", entityTypeScope] as const;
    const prev = queryClient.getQueryData<CustomFieldDefinition[]>(key) ?? [];
    const oldIndex = prev.findIndex((d) => d.id === active.id);
    const newIndex = prev.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const moved = arrayMove(prev, oldIndex, newIndex);
    queryClient.setQueryData<CustomFieldDefinition[]>(key, moved);
    api.customFields.reorder(moved.map((d) => d.id)).catch(() => invalidate());
  };

  const colCount = isEditor ? 6 : 4;

  const renderTable = (defs: CustomFieldDefinition[], emptyMsg: string, entityTypeScope: "work" | "performer") => (
    <DndContext
      sensors={isEditor ? sensors : []}
      collisionDetection={closestCenter}
      onDragEnd={(e) => handleDragEnd(e, entityTypeScope)}
    >
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {isEditor && <th className="px-2 py-2 w-6"></th>}
              <th className="text-left px-4 py-2 font-medium">項目名</th>
              <th className="text-left px-4 py-2 font-medium">型</th>
              <th className="px-4 py-2 font-medium text-center text-xs">並べ替えOK</th>
              <th className="px-4 py-2 font-medium text-center text-xs whitespace-nowrap">検索キーワード</th>
              {isEditor && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            <SortableContext items={defs.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {defs.map((d) => (
                <SortableRow
                  key={d.id}
                  def={d}
                  isEditor={isEditor}
                  onToggleSortable={(checked) => updateMutation.mutate({ id: d.id, data: { is_sortable: checked } })}
                  onToggleSearchKeyword={(checked) => updateMutation.mutate({ id: d.id, data: { is_search_keyword: checked } })}
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
                <td colSpan={colCount} className="px-4 py-8 text-center text-muted-foreground">{emptyMsg}</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </DndContext>
  );

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await api.data.exportAndDownload();
    } catch (e) {
      alert(`エクスポートに失敗しました: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportFileSelect = (file: File) => {
    setPendingFile(file);
    setImportStatus(null);
    setImportConfirmOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeImport = async () => {
    if (!pendingFile) return;
    setImportLoading(true);
    try {
      const result = await api.data.import(pendingFile);
      setImportStatus(result.message);
      setImportConfirmOpen(false);
      setPendingFile(null);
      window.location.reload();
    } catch (e) {
      setImportStatus(`エラー: ${e instanceof Error ? e.message : String(e)}`);
      setImportConfirmOpen(false);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-lg">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* 表示設定セクション */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">表示設定</h2>
        <div className="flex items-center gap-4">
          <Label className="whitespace-nowrap">グリッド最大列数</Label>
          <Input
            type="number"
            min={2}
            max={12}
            value={maxCols}
            onChange={(e) => setMaxCols(parseInt(e.target.value, 10))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">列（2〜12）</span>
        </div>
      </section>

      {/* カスタム項目セクション */}
      <section className="space-y-8">
        <h2 className="text-lg font-semibold border-b pb-2">カスタム項目</h2>

        <div className="space-y-3">
          <h3 className="font-medium">作品用カスタム項目</h3>
          {renderTable(workDefs, "作品用カスタム項目がありません", "work")}
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">出演者用カスタム項目</h3>
          {renderTable(performerDefs, "出演者用カスタム項目がありません", "performer")}
        </div>

        {isEditor && <div className="space-y-3 border rounded-lg p-4">
          <h3 className="font-semibold text-sm">項目を追加</h3>
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
        </div>}
      </section>

      {/* データ管理セクション */}
      {isEditor && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">データ管理</h2>
          <p className="text-sm text-muted-foreground">
            全登録データのエクスポート・インポートを行います。インポートは既存データを完全に置き換えます。
          </p>
          <p className="text-xs text-muted-foreground">
            エクスポートは画像を含む全データをZIPに圧縮するため、データ量によって数秒かかる場合があります。
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport} disabled={exportLoading || importLoading}>
              <Download size={16} />{exportLoading ? "エクスポート中…" : "エクスポート"}
            </Button>
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFileSelect(f); }}
              />
              <Button variant="outline" asChild>
                <span><Upload size={16} />インポート</span>
              </Button>
            </label>
          </div>

          {importStatus && (
            <p className={`text-sm ${importStatus.startsWith("エラー") ? "text-destructive" : "text-green-600"}`}>
              {importStatus}
            </p>
          )}
        </section>
      )}

      {/* アプリケーション情報セクション */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">アプリケーション情報</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">バージョン</span>
          <span className="text-sm font-mono">{import.meta.env.VITE_APP_VERSION}</span>
        </div>
      </section>

      {/* インポート確認ダイアログ */}
      <Dialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>インポートの確認</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-destructive font-medium">
              現在の全データが置き換えられます。この操作は元に戻せません。
            </p>
            {pendingFile && (
              <p className="text-sm text-muted-foreground font-mono break-all">{pendingFile.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              続行してよろしいですか？
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setImportConfirmOpen(false)}>キャンセル</Button>
              <Button variant="destructive" onClick={executeImport} disabled={importLoading}>
                {importLoading ? "インポート中…" : "インポートする"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
