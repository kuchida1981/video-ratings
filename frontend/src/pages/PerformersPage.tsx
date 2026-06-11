import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowUpDown, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CustomFieldDefinition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PerformerTile } from "@/components/PerformerTile";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const PERFORMERS_STORAGE_KEY = "video-ratings:performers-filters";
const DEFAULT_PERFORMERS_SORT_BY = "name";
const DEFAULT_PERFORMERS_SORT_DESC = false;

function defaultSortDescForFieldType(fieldType: CustomFieldDefinition["field_type"]): boolean {
  return fieldType !== "text";
}

function loadPerformersFilters() {
  try { return JSON.parse(localStorage.getItem(PERFORMERS_STORAGE_KEY) ?? "{}"); }
  catch { return {}; }
}

export default function PerformersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useDocumentTitle("出演者一覧");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");

  const stored = loadPerformersFilters();
  const [sortBy, setSortBy] = useState<string>(stored.sortBy ?? DEFAULT_PERFORMERS_SORT_BY);
  const [sortDesc, setSortDesc] = useState<boolean>(stored.sortDesc ?? DEFAULT_PERFORMERS_SORT_DESC);
  const [onlyUnrated, setOnlyUnrated] = useState<boolean>(stored.onlyUnrated ?? false);
  const [onlyNoCover, setOnlyNoCover] = useState<boolean>(stored.onlyNoCover ?? false);

  const { maxCols } = useTileMaxColumns();
  const gridStyle = useTileGridStyle(maxCols);

  const { data: performers = [] } = useQuery({
    queryKey: ["performers"],
    queryFn: () => api.performers.list(),
  });

  const { data: customFieldDefs = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["customFields", "performer"],
    queryFn: () => api.customFields.list("performer"),
  });

  const sortableCustomFields = customFieldDefs.filter((d) => d.is_sortable);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; furigana?: string }) => api.performers.create(data),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ["performers"] });
      setOpen(false);
      setName("");
      setFurigana("");
      navigate(`/performers/${p.id}`);
    },
  });

  const saveSortState = (newSortBy: typeof sortBy, newSortDesc: boolean, newOnlyUnrated: boolean, newOnlyNoCover: boolean) => {
    localStorage.setItem(PERFORMERS_STORAGE_KEY, JSON.stringify({
      sortBy: newSortBy, sortDesc: newSortDesc, onlyUnrated: newOnlyUnrated, onlyNoCover: newOnlyNoCover,
    }));
  };

  const hasFilters = !!(onlyUnrated || onlyNoCover || sortBy !== DEFAULT_PERFORMERS_SORT_BY || sortDesc !== DEFAULT_PERFORMERS_SORT_DESC);

  const resetFilters = () => {
    setSortBy(DEFAULT_PERFORMERS_SORT_BY);
    setSortDesc(DEFAULT_PERFORMERS_SORT_DESC);
    setOnlyUnrated(false);
    setOnlyNoCover(false);
    localStorage.removeItem(PERFORMERS_STORAGE_KEY);
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
      } else if (sortBy.startsWith("custom:")) {
        const fieldName = sortBy.slice("custom:".length);
        const va = (a.custom_fields ?? {})[fieldName] ?? null;
        const vb = (b.custom_fields ?? {})[fieldName] ?? null;
        if (va === null && vb === null) comparison = 0;
        else if (va === null) return 1;
        else if (vb === null) return -1;
        else if (typeof va === "number" && typeof vb === "number") comparison = va - vb;
        else if (typeof va === "boolean" && typeof vb === "boolean") comparison = Number(va) - Number(vb);
        else comparison = String(va).localeCompare(String(vb), "ja");
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
              <Button onClick={() => createMutation.mutate({ name, furigana: furigana || undefined })} disabled={!name.trim()} className="w-full">登録する</Button>
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
            onClick={() => { const v = !onlyUnrated; setOnlyUnrated(v); saveSortState(sortBy, sortDesc, v, onlyNoCover); }}
          >
            未評価のみ
          </Badge>
          <Badge
            variant={onlyNoCover ? "default" : "outline"}
            className="cursor-pointer py-1.5"
            onClick={() => { const v = !onlyNoCover; setOnlyNoCover(v); saveSortState(sortBy, sortDesc, onlyUnrated, v); }}
          >
            カバー画像なし
          </Badge>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="ml-1"><X size={14} />フィルタ全解除</Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredPerformers.length} 件</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newDesc = sortBy === "name" ? !sortDesc : false;
              const newBy = "name";
              setSortBy(newBy);
              setSortDesc(newDesc);
              saveSortState(newBy, newDesc, onlyUnrated, onlyNoCover);
            }}
            className={sortBy === "name" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />名前順
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newDesc = sortBy === "work_count" ? !sortDesc : true;
              const newBy = "work_count";
              setSortBy(newBy);
              setSortDesc(newDesc);
              saveSortState(newBy, newDesc, onlyUnrated, onlyNoCover);
            }}
            className={sortBy === "work_count" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />作品数順
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newDesc = sortBy === "avg_work_score" ? !sortDesc : true;
              const newBy = "avg_work_score";
              setSortBy(newBy);
              setSortDesc(newDesc);
              saveSortState(newBy, newDesc, onlyUnrated, onlyNoCover);
            }}
            className={sortBy === "avg_work_score" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />作品平均点数順
          </Button>
          {sortableCustomFields.map((cf) => {
            const key = `custom:${cf.name}`;
            return (
              <Button
                key={cf.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDesc = sortBy === key ? !sortDesc : defaultSortDescForFieldType(cf.field_type);
                  setSortBy(key);
                  setSortDesc(newDesc);
                  saveSortState(key, newDesc, onlyUnrated, onlyNoCover);
                }}
                className={sortBy === key ? "text-primary" : ""}
              >
                <ArrowUpDown size={14} />{cf.name}
              </Button>
            );
          })}
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
