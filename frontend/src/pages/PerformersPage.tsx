import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowUpDown } from "lucide-react";
import { api } from "@/api/client";
import type { Performer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PerformerTile } from "@/components/PerformerTile";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";

export default function PerformersPage() {
  const navigate = useNavigate();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "work_count" | "avg_work_score">("name");
  const [sortDesc, setSortDesc] = useState(false);
  const [onlyUnrated, setOnlyUnrated] = useState(false);
  const [onlyNoCover, setOnlyNoCover] = useState(false);

  const { maxCols } = useTileMaxColumns();
  const gridStyle = useTileGridStyle(maxCols);

  useEffect(() => {
    api.performers.list().then(setPerformers);
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    const p = await api.performers.create({ name, furigana: furigana || undefined });
    setOpen(false);
    setName("");
    setFurigana("");
    navigate(`/performers/${p.id}`);
  };

  const sortedPerformers = useMemo(() => {
    const list = [...performers];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        const nameA = a.furigana || a.name;
        const nameB = b.furigana || b.name;
        comparison = nameA.localeCompare(nameB, "ja");
      } else if (sortBy === "work_count") {
        comparison = a.work_count - b.work_count;
      } else if (sortBy === "avg_work_score") {
        comparison = a.avg_work_score - b.avg_work_score;
      }

      if (comparison !== 0) {
        return sortDesc ? -comparison : comparison;
      }

      // Fallback sort: always by name ascending
      const nameA = a.furigana || a.name;
      const nameB = b.furigana || b.name;
      return nameA.localeCompare(nameB, "ja");
    });
    return list;
  }, [performers, sortBy, sortDesc]);

  const filteredPerformers = useMemo(() => {
    let result = sortedPerformers;
    if (onlyUnrated) result = result.filter((p) => p.tags.length === 0);
    if (onlyNoCover) result = result.filter((p) => p.cover_image_url === null);
    return result;
  }, [sortedPerformers, onlyUnrated, onlyNoCover]);

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

      {/* Search & Filters (Matching WorksPage style) */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={onlyUnrated ? "default" : "outline"}
            className="cursor-pointer py-1.5"
            onClick={() => setOnlyUnrated((v) => !v)}
          >
            未評価のみ
          </Badge>
          <Badge
            variant={onlyNoCover ? "default" : "outline"}
            className="cursor-pointer py-1.5"
            onClick={() => setOnlyNoCover((v) => !v)}
          >
            カバー画像なし
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredPerformers.length} 件</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy === "name") setSortDesc((d) => !d);
              else { setSortBy("name"); setSortDesc(false); }
            }}
            className={sortBy === "name" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />名前順
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy === "work_count") setSortDesc((d) => !d);
              else { setSortBy("work_count"); setSortDesc(true); }
            }}
            className={sortBy === "work_count" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />作品数順
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy === "avg_work_score") setSortDesc((d) => !d);
              else { setSortBy("avg_work_score"); setSortDesc(true); }
            }}
            className={sortBy === "avg_work_score" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />作品平均点数順
          </Button>
        </div>
      </div>

      {filteredPerformers.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">出演者が登録されていません</p>
      ) : (
        <div className="grid gap-3" style={gridStyle}>
          {filteredPerformers.map((p) => (
            <PerformerTile key={p.id} performer={p} onClick={() => navigate(`/performers/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
