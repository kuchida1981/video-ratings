import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
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
import { api } from "@/api/client";
import type { TagCategory, Tag } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SortableItem({ id, children, className, handle = false }: { id: number; children: React.ReactNode; className?: string; handle?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {handle ? (
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical size={16} />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      ) : (
        <div {...attributes} {...listeners}>{children}</div>
      )}
    </div>
  );
}

export default function TagsPage() {
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catEntityType, setCatEntityType] = useState<"work" | "performer">("work");
  const [catMulti, setCatMulti] = useState(true);
  const [tagOpen, setTagOpen] = useState<number | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagScore, setTagScore] = useState("");
  const [tagDescription, setTagDescription] = useState("");
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editScore, setEditScore] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDescription, setEditCatDescription] = useState("");
  const [editCatMulti, setEditCatMulti] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reload = () => api.tagCategories.list().then(setCategories);
  useEffect(() => {
    api.tagCategories.list().then((data) => {
      setCategories(data);
      setExpanded(new Set(data.map((c) => c.id)));
    });
  }, []);

  const createCategory = async () => {
    if (!catName.trim()) return;
    await api.tagCategories.create({
      name: catName,
      entity_type: catEntityType,
      is_multi_select: catMulti,
      description: catDescription.trim() || null,
    });
    setCatOpen(false);
    setCatName("");
    setCatDescription("");
    reload();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("このカテゴリとタグを全て削除しますか？")) return;
    await api.tagCategories.delete(id);
    reload();
  };

  const createTag = async (categoryId: number) => {
    if (!tagName.trim()) return;
    const score = tagScore !== "" ? Number(tagScore) : null;
    await api.tags.create({
      name: tagName,
      category_id: categoryId,
      score,
      description: tagDescription.trim() || null,
    });
    setTagOpen(null);
    setTagName("");
    setTagScore("");
    setTagDescription("");
    reload();
  };

  const deleteTag = async (tagId: number) => {
    if (!confirm("このタグを削除しますか？")) return;
    await api.tags.delete(tagId);
    reload();
  };

  const handleDragEndCategories = async (event: DragEndEvent, entityType: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((prev) => {
        const etCats = prev.filter((c) => c.entity_type === entityType);
        const others = prev.filter((c) => c.entity_type !== entityType);
        const oldIndex = etCats.findIndex((c) => c.id === active.id);
        const newIndex = etCats.findIndex((c) => c.id === over.id);
        const moved = arrayMove(etCats, oldIndex, newIndex);
        
        const result = entityType === "work" ? [...moved, ...others] : [...others, ...moved];
        
        api.tagCategories.reorder(moved.map((c) => c.id)).catch(() => reload());
        return result;
      });
    }
  };

  const handleDragEndTags = async (event: DragEndEvent, categoryId: number) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((prev) => {
        return prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          const oldIndex = cat.tags.findIndex((t) => t.id === active.id);
          const newIndex = cat.tags.findIndex((t) => t.id === over.id);
          const moved = arrayMove(cat.tags, oldIndex, newIndex);
          
          api.tags.reorder(moved.map((t) => t.id)).catch(() => reload());
          return { ...cat, tags: moved };
        });
      });
    }
  };

  const openEdit = (tag: { id: number; name: string; score: number | null; description: string | null }) => {
    setTagOpen(null);
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditScore(tag.score != null ? String(tag.score) : "");
    setEditDescription(tag.description || "");
  };

  const closeEdit = () => setEditingTagId(null);

  const updateTag = async (tagId: number) => {
    if (!editName.trim()) return;
    const score = editScore !== "" ? Number(editScore) : null;
    await api.tags.update(tagId, {
      name: editName,
      score,
      description: editDescription.trim() || null,
    });
    closeEdit();
    reload();
  };

  const openEditCat = (cat: TagCategory) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatMulti(cat.is_multi_select);
    setEditCatDescription(cat.description || "");
  };

  const closeEditCat = () => setEditingCatId(null);

  const updateCategory = async (catId: number) => {
    if (!editCatName.trim()) return;
    await api.tagCategories.update(catId, {
      name: editCatName,
      is_multi_select: editCatMulti,
      description: editCatDescription.trim() || null,
    });
    closeEditCat();
    reload();
  };

  const toggle = (id: number) =>
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">タグ管理</h1>
        <Dialog open={catOpen} onOpenChange={setCatOpen}>
          <DialogTrigger asChild>
            <Button><Plus size={16} />カテゴリ追加</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>タグカテゴリを追加</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>カテゴリ名</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} /></div>
              <div><Label>説明</Label><Input value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="カテゴリの補足説明（任意）" /></div>
              <div>
                <Label>対象</Label>
                <Select value={catEntityType} onValueChange={(v) => setCatEntityType(v as "work" | "performer")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">作品</SelectItem>
                    <SelectItem value="performer">出演者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="multi" checked={catMulti} onChange={(e) => setCatMulti(e.target.checked)} />
                <Label htmlFor="multi">複数選択可</Label>
              </div>
              <Button onClick={createCategory} disabled={!catName.trim()} className="w-full">作成</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {["work", "performer"].map((et) => {
        const cats = categories.filter((c) => c.entity_type === et);
        return (
          <section key={et} className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              {et === "work" ? "作品用カテゴリ" : "出演者用カテゴリ"}
            </h2>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEndCategories(e, et)}>
              <SortableContext items={cats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {cats.map((cat) => (
                    <SortableItem key={cat.id} id={cat.id} handle className="border rounded-lg overflow-hidden bg-card">
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
                          <input
                            className="flex-[2] border rounded px-2 py-1 text-sm bg-background"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            autoFocus
                          />
                          <input
                            className="flex-[3] border rounded px-2 py-1 text-sm bg-background"
                            value={editCatDescription}
                            onChange={(e) => setEditCatDescription(e.target.value)}
                            placeholder="説明（任意）"
                          />
                          <div className="flex items-center gap-1 text-sm text-nowrap">
                            <input
                              type="checkbox"
                              id={`cat-multi-${cat.id}`}
                              checked={editCatMulti}
                              onChange={(e) => setEditCatMulti(e.target.checked)}
                            />
                            <label htmlFor={`cat-multi-${cat.id}`}>複数可</label>
                          </div>
                          <Button size="sm" onClick={() => updateCategory(cat.id)} disabled={!editCatName.trim()}>保存</Button>
                          <Button size="sm" variant="outline" onClick={closeEditCat}>×</Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 px-4 py-2 bg-muted/30 cursor-pointer"
                          onClick={() => toggle(cat.id)}
                        >
                          {expanded.has(cat.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="font-medium flex-1">{cat.name}</span>
                          <Badge variant="outline" className="text-xs">{cat.is_multi_select ? "複数可" : "単一選択"}</Badge>
                          <button
                            className="text-muted-foreground hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); openEditCat(cat); }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      {expanded.has(cat.id) && (
                        <div className="p-3 space-y-3 bg-background">
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEndTags(e, cat.id)}>
                            <SortableContext items={cat.tags.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                              <div className="space-y-1">
                                {cat.tags.map((tag) => (
                                  <SortableItem key={tag.id} id={tag.id} handle className="group">
                                    {editingTagId === tag.id ? (
                                      <div className="flex gap-2 items-end w-full border rounded-lg p-2 bg-muted/20">
                                        <div className="flex-[2]"><Label className="text-xs">タグ名</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                                        <div className="flex-[3]"><Label className="text-xs">説明</Label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="説明（任意）" /></div>
                                        <div className="w-20"><Label className="text-xs">点数</Label><Input type="number" value={editScore} onChange={(e) => setEditScore(e.target.value)} placeholder="なし" /></div>
                                        <Button size="sm" onClick={() => updateTag(tag.id)} disabled={!editName.trim()}>保存</Button>
                                        <Button size="sm" variant="outline" onClick={closeEdit}>×</Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded transition-colors">
                                        <div className="flex-1 flex items-center gap-2">
                                          <span className="text-sm font-medium">{tag.name}</span>
                                          {tag.score != null && <Badge variant="secondary" className="text-[10px] h-4 px-1">+{tag.score}</Badge>}
                                          {tag.description && <span className="text-xs text-muted-foreground truncate">{tag.description}</span>}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            className="text-muted-foreground hover:text-primary p-1"
                                            onClick={() => openEdit(tag)}
                                          ><Pencil size={14} /></button>
                                          <button
                                            className="text-muted-foreground hover:text-destructive p-1"
                                            onClick={() => deleteTag(tag.id)}
                                          ><Trash2 size={14} /></button>
                                        </div>
                                      </div>
                                    )}
                                  </SortableItem>
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                          
                          {tagOpen === cat.id ? (
                            <div className="flex gap-2 items-end border-t pt-3 mt-1">
                              <div className="flex-[2]"><Label className="text-xs">タグ名</Label><Input value={tagName} onChange={(e) => setTagName(e.target.value)} /></div>
                              <div className="flex-[3]"><Label className="text-xs">説明</Label><Input value={tagDescription} onChange={(e) => setTagDescription(e.target.value)} placeholder="（任意）" /></div>
                              <div className="w-20"><Label className="text-xs">点数</Label><Input type="number" value={tagScore} onChange={(e) => setTagScore(e.target.value)} placeholder="なし" /></div>
                              <Button size="sm" onClick={() => createTag(cat.id)}>追加</Button>
                              <Button size="sm" variant="outline" onClick={() => { setTagOpen(null); setTagName(""); setTagScore(""); setTagDescription(""); }}>×</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary" onClick={() => { setTagOpen(cat.id); setTagName(""); setTagScore(""); setTagDescription(""); setEditingTagId(null); }}>
                              <Plus size={14} className="mr-2" />タグを追加
                            </Button>
                          )}
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        );
      })}
    </div>
  );
}
