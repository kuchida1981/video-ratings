import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, ArrowUpDown } from "lucide-react";
import { api } from "@/api/client";
import type { WorkListItem, TagCategory, CustomFieldDefinition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function WorksPage() {
  const navigate = useNavigate();
  const [works, setWorks] = useState<WorkListItem[]>([]);
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  const [keyword, setKeyword] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [maker, setMaker] = useState("");
  const [series, setSeries] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "total_score">("created_at");
  const [sortDesc, setSortDesc] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMaker, setNewMaker] = useState("");
  const [newSeries, setNewSeries] = useState("");

  const fetchWorks = useCallback(async () => {
    const params: Record<string, string | number | boolean | string[]> = {
      sort_by: sortBy,
      sort_desc: sortDesc,
    };
    if (keyword) params.keyword = keyword;
    if (maker) params.maker = maker;
    if (series) params.series = series;
    if (selectedTagIds.length) params.tag_ids = selectedTagIds.map(String);
    const data = await api.works.search(params);
    setWorks(data);
  }, [keyword, maker, series, selectedTagIds, sortBy, sortDesc]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  useEffect(() => {
    api.tagCategories.list("work").then(setCategories);
    api.customFields.list().then(setCustomFields);
  }, []);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const resetFilters = () => {
    setKeyword("");
    setMaker("");
    setSeries("");
    setSelectedTagIds([]);
  };

  const createWork = async () => {
    if (!newTitle.trim()) return;
    const work = await api.works.create({ title: newTitle, maker: newMaker || undefined, series: newSeries || undefined });
    setCreateOpen(false);
    setNewTitle("");
    setNewMaker("");
    setNewSeries("");
    navigate(`/works/${work.id}`);
  };

  const hasFilters = keyword || maker || series || selectedTagIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">作品一覧</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus size={16} />新規登録</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>作品を登録</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>作品名 *</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="作品名" /></div>
              <div><Label>メーカー</Label><Input value={newMaker} onChange={(e) => setNewMaker(e.target.value)} placeholder="メーカー" /></div>
              <div><Label>シリーズ</Label><Input value={newSeries} onChange={(e) => setNewSeries(e.target.value)} placeholder="シリーズ" /></div>
              <Button onClick={createWork} disabled={!newTitle.trim()} className="w-full">登録する</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="作品名・出演者・メーカー・シリーズで検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <Input className="w-40" placeholder="メーカー" value={maker} onChange={(e) => setMaker(e.target.value)} />
          <Input className="w-40" placeholder="シリーズ" value={series} onChange={(e) => setSeries(e.target.value)} />
          {hasFilters && (
            <Button variant="outline" onClick={resetFilters}><X size={16} />リセット</Button>
          )}
        </div>

        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="text-xs text-muted-foreground mb-1">{cat.name}</div>
            <div className="flex flex-wrap gap-1">
              {cat.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}{tag.score != null ? ` (+${tag.score})` : ""}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{works.length} 件</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy === "total_score") setSortDesc((d) => !d);
              else { setSortBy("total_score"); setSortDesc(true); }
            }}
            className={sortBy === "total_score" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />スコア順
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy === "created_at") setSortDesc((d) => !d);
              else { setSortBy("created_at"); setSortDesc(true); }
            }}
            className={sortBy === "created_at" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />登録日順
          </Button>
        </div>
      </div>

      {/* Works table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">出演者</th>
              <th className="text-left px-4 py-2 font-medium">作品名</th>
              <th className="text-left px-4 py-2 font-medium">メーカー</th>
              <th className="text-left px-4 py-2 font-medium">シリーズ</th>
              <th className="text-right px-4 py-2 font-medium">スコア</th>
              <th className="text-left px-4 py-2 font-medium">登録日</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr
                key={w.id}
                className="border-t hover:bg-muted/30 cursor-pointer"
                onClick={() => navigate(`/works/${w.id}`)}
              >
                <td className="px-4 py-2 text-muted-foreground">
                  {w.performers.length > 0 ? w.performers.map((p) => p.name).join(", ") : "—"}
                </td>
                <td className="px-4 py-2 font-medium">{w.title}</td>
                <td className="px-4 py-2 text-muted-foreground">{w.maker ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{w.series ?? "—"}</td>
                <td className="px-4 py-2 text-right font-mono">{w.total_score}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(w.created_at).toLocaleDateString("ja-JP")}</td>
              </tr>
            ))}
            {works.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">作品が見つかりません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
