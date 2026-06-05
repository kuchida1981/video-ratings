import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "@/api/client";
import type { TagCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <section key={et}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              {et === "work" ? "作品用カテゴリ" : "出演者用カテゴリ"}
            </h2>
            <div className="space-y-2">
              {cats.map((cat) => (
                <div key={cat.id} className="border rounded-lg overflow-hidden">
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
                      <input
                        className="flex-[2] border rounded px-2 py-1 text-sm"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        autoFocus
                      />
                      <input
                        className="flex-[3] border rounded px-2 py-1 text-sm"
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
                    <div className="p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {cat.tags.map((tag) =>
                          editingTagId === tag.id ? (
                            <div key={tag.id} className="flex gap-2 items-end w-full border rounded-lg p-2 bg-muted/20">
                              <div className="flex-[2]"><Label className="text-xs">タグ名</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                              <div className="flex-[3]"><Label className="text-xs">説明</Label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="説明（任意）" /></div>
                              <div className="w-20"><Label className="text-xs">点数</Label><Input type="number" value={editScore} onChange={(e) => setEditScore(e.target.value)} placeholder="なし" /></div>
                              <Button size="sm" onClick={() => updateTag(tag.id)} disabled={!editName.trim()}>保存</Button>
                              <Button size="sm" variant="outline" onClick={closeEdit}>×</Button>
                            </div>
                          ) : (
                            <div key={tag.id} className="flex items-center gap-1 border rounded-full px-3 py-0.5 text-sm">
                              <span>{tag.name}</span>
                              {tag.score != null && <span className="text-muted-foreground text-xs">+{tag.score}</span>}
                              <button
                                className="text-muted-foreground hover:text-primary ml-1"
                                onClick={() => openEdit(tag)}
                              ><Pencil size={11} /></button>
                              <button
                                className="text-muted-foreground hover:text-destructive ml-0.5"
                                onClick={() => deleteTag(tag.id)}
                              >×</button>
                            </div>
                          )
                        )}
                      </div>
                      {tagOpen === cat.id ? (
                        <div className="flex gap-2 items-end">
                          <div className="flex-[2]"><Label className="text-xs">タグ名</Label><Input value={tagName} onChange={(e) => setTagName(e.target.value)} /></div>
                          <div className="flex-[3]"><Label className="text-xs">説明</Label><Input value={tagDescription} onChange={(e) => setTagDescription(e.target.value)} placeholder="（任意）" /></div>
                          <div className="w-20"><Label className="text-xs">点数</Label><Input type="number" value={tagScore} onChange={(e) => setTagScore(e.target.value)} placeholder="なし" /></div>
                          <Button size="sm" onClick={() => createTag(cat.id)}>追加</Button>
                          <Button size="sm" variant="outline" onClick={() => setTagOpen(null)}>×</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setTagOpen(cat.id); setTagName(""); setTagScore(""); setTagDescription(""); setEditingTagId(null); }}>
                          <Plus size={14} />タグを追加
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
