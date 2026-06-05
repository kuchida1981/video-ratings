import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
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
  const [catEntityType, setCatEntityType] = useState<"work" | "performer">("work");
  const [catMulti, setCatMulti] = useState(true);
  const [tagOpen, setTagOpen] = useState<number | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagScore, setTagScore] = useState("");

  const reload = () => api.tagCategories.list().then(setCategories);
  useEffect(() => { reload(); }, []);

  const createCategory = async () => {
    if (!catName.trim()) return;
    await api.tagCategories.create({ name: catName, entity_type: catEntityType, is_multi_select: catMulti });
    setCatOpen(false);
    setCatName("");
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
    await api.tags.create({ name: tagName, category_id: categoryId, score });
    setTagOpen(null);
    setTagName("");
    setTagScore("");
    reload();
  };

  const deleteTag = async (tagId: number) => {
    if (!confirm("このタグを削除しますか？")) return;
    await api.tags.delete(tagId);
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
                  <div
                    className="flex items-center gap-2 px-4 py-2 bg-muted/30 cursor-pointer"
                    onClick={() => toggle(cat.id)}
                  >
                    {expanded.has(cat.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="font-medium flex-1">{cat.name}</span>
                    <Badge variant="outline" className="text-xs">{cat.is_multi_select ? "複数可" : "単一選択"}</Badge>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {expanded.has(cat.id) && (
                    <div className="p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {cat.tags.map((tag) => (
                          <div key={tag.id} className="flex items-center gap-1 border rounded-full px-3 py-0.5 text-sm">
                            <span>{tag.name}</span>
                            {tag.score != null && <span className="text-muted-foreground text-xs">+{tag.score}</span>}
                            <button
                              className="text-muted-foreground hover:text-destructive ml-1"
                              onClick={() => deleteTag(tag.id)}
                            >×</button>
                          </div>
                        ))}
                      </div>
                      {tagOpen === cat.id ? (
                        <div className="flex gap-2 items-end">
                          <div className="flex-1"><Label className="text-xs">タグ名</Label><Input value={tagName} onChange={(e) => setTagName(e.target.value)} /></div>
                          <div className="w-24"><Label className="text-xs">点数</Label><Input type="number" value={tagScore} onChange={(e) => setTagScore(e.target.value)} placeholder="なし" /></div>
                          <Button size="sm" onClick={() => createTag(cat.id)}>追加</Button>
                          <Button size="sm" variant="outline" onClick={() => setTagOpen(null)}>×</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setTagOpen(cat.id); setTagName(""); setTagScore(""); }}>
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
