import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowUpDown, X, LayoutGrid, List, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CustomFieldDefinition, PerformerColumnKey } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PerformerTile } from "@/components/PerformerTile";
import { PerformerTable } from "@/components/PerformerTable";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const PERFORMERS_STORAGE_KEY = "video-ratings:performers-filters";
const PERFORMERS_TABLE_COLUMNS_KEY = "video-ratings:performers-table-columns";
const PERFORMERS_VIEW_MODE_KEY = "video-ratings:performers-view-mode";
const DEFAULT_PERFORMERS_TABLE_COLUMNS: PerformerColumnKey[] = ["work_count", "avg_work_score"];

function loadPerformersTableColumns(): PerformerColumnKey[] {
  try {
    const saved = JSON.parse(localStorage.getItem(PERFORMERS_TABLE_COLUMNS_KEY) ?? "null");
    return Array.isArray(saved) ? saved : DEFAULT_PERFORMERS_TABLE_COLUMNS;
  } catch {
    return DEFAULT_PERFORMERS_TABLE_COLUMNS;
  }
}
const DEFAULT_PERFORMERS_SORT_BY = "name";
const DEFAULT_PERFORMERS_SORT_DESC = false;

function defaultSortDescForFieldType(fieldType: CustomFieldDefinition["field_type"]): boolean {
  return fieldType !== "text";
}

function loadPerformersFilters() {
  try { return JSON.parse(localStorage.getItem(PERFORMERS_STORAGE_KEY) ?? "{}"); }
  catch { return {}; }
}

function loadPerformersViewMode(): "tile" | "table" {
  try {
    const saved = localStorage.getItem(PERFORMERS_VIEW_MODE_KEY);
    if (saved === "tile" || saved === "table") {
      return saved;
    }
  } catch {
    // Ignore storage errors and fallback to default
  }
  return "tile";
}

export default function PerformersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isEditor } = useAuth();
  useDocumentTitle("出演者一覧");
  useScrollRestoration("video-ratings:performers-scroll-y");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");

  const stored = loadPerformersFilters();
  const [sortBy, setSortBy] = useState<string>(stored.sortBy ?? DEFAULT_PERFORMERS_SORT_BY);
  const [sortDesc, setSortDesc] = useState<boolean>(stored.sortDesc ?? DEFAULT_PERFORMERS_SORT_DESC);
  const [onlyUnrated, setOnlyUnrated] = useState<boolean>(stored.onlyUnrated ?? false);
  const [onlyNoCover, setOnlyNoCover] = useState<boolean>(stored.onlyNoCover ?? false);
  const [viewMode, setViewMode] = useState<"tile" | "table">(loadPerformersViewMode);
  const [editMode, setEditMode] = useState(false);
  const [visiblePerformerColumns, setVisiblePerformerColumns] = useState<PerformerColumnKey[]>(loadPerformersTableColumns);

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

  const isEditModeDisabled = customFieldDefs.filter(
    (d) => visiblePerformerColumns.includes(`custom:${d.name}` as PerformerColumnKey)
  ).length === 0;

  const isFirstRender = useRef(true);
  const pendingSaveRef = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!editMode) {
      pendingSaveRef.current.finally(() => {
        queryClient.invalidateQueries({ queryKey: ["performers"] });
      });
    }
  }, [editMode, queryClient]);

  useEffect(() => {
    if (isEditModeDisabled && editMode) {
      setEditMode(false);
    }
  }, [isEditModeDisabled, editMode]);

  const handleUpdateCustomField = useCallback(async (performerId: number, fieldName: string, value: unknown) => {
    const save = api.performers.updateCustomFields(performerId, { [fieldName]: value }).then(() => {});
    pendingSaveRef.current = pendingSaveRef.current.then(() => save).catch(() => {});
    await save;
  }, []);

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

  useEffect(() => {
    try {
      localStorage.setItem(PERFORMERS_VIEW_MODE_KEY, viewMode);
    } catch (e) {
      console.error("Failed to save viewMode to localStorage", e);
    }
    if (viewMode !== "table") {
      setEditMode(false);
    }
  }, [viewMode]);

  const hasFilters = !!(onlyUnrated || onlyNoCover || sortBy !== DEFAULT_PERFORMERS_SORT_BY || sortDesc !== DEFAULT_PERFORMERS_SORT_DESC);

  const resetFilters = () => {
    setSortBy(DEFAULT_PERFORMERS_SORT_BY);
    setSortDesc(DEFAULT_PERFORMERS_SORT_DESC);
    setOnlyUnrated(false);
    setOnlyNoCover(false);
    localStorage.removeItem(PERFORMERS_STORAGE_KEY);
  };

  const togglePerformerColumn = (key: PerformerColumnKey) => {
    const next = visiblePerformerColumns.includes(key)
      ? visiblePerformerColumns.filter((k) => k !== key)
      : [...visiblePerformerColumns, key];
    setVisiblePerformerColumns(next);
    localStorage.setItem(PERFORMERS_TABLE_COLUMNS_KEY, JSON.stringify(next));
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
      } else if (sortBy === "total_score") {
        comparison = a.total_score - b.total_score;
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
        <div className="flex gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={viewMode === "tile" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode("tile")}
              title="タイル表示"
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode("table")}
              title="テーブル表示"
            >
              <List size={16} />
            </Button>
          </div>
          {isEditor && viewMode === "table" && (
            <Button
              variant={editMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setEditMode((v) => !v)}
              title="編集モード"
              disabled={isEditModeDisabled}
            >
              <Pencil size={16} />
            </Button>
          )}
          {isEditor && (
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
          )}
        </div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newDesc = sortBy === "total_score" ? !sortDesc : true;
              const newBy = "total_score";
              setSortBy(newBy);
              setSortDesc(newDesc);
              saveSortState(newBy, newDesc, onlyUnrated, onlyNoCover);
            }}
            className={sortBy === "total_score" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />合計スコア順
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

        {viewMode === "table" && (
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">表示列</div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { key: "work_count" as PerformerColumnKey, label: "作品数" },
                  { key: "avg_work_score" as PerformerColumnKey, label: "平均スコア" },
                  { key: "total_score" as PerformerColumnKey, label: "合計スコア" },
                  { key: "tags" as PerformerColumnKey, label: "タグ" },
                ] as { key: PerformerColumnKey; label: string }[]
              ).map(({ key, label }) => (
                <Badge
                  key={key}
                  variant={visiblePerformerColumns.includes(key) ? "default" : "outline"}
                  className="cursor-pointer py-1.5"
                  onClick={() => togglePerformerColumn(key)}
                >
                  {label}
                </Badge>
              ))}
              {customFieldDefs.map((cf) => {
                const key = `custom:${cf.name}` as PerformerColumnKey;
                return (
                  <Badge
                    key={cf.id}
                    variant={visiblePerformerColumns.includes(key) ? "default" : "outline"}
                    className="cursor-pointer py-1.5"
                    onClick={() => togglePerformerColumn(key)}
                  >
                    {cf.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filteredPerformers.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">出演者が登録されていません</p>
      ) : viewMode === "table" ? (
        <PerformerTable
          performers={filteredPerformers}
          visibleColumns={visiblePerformerColumns}
          customFieldDefs={customFieldDefs}
          editMode={editMode}
          onUpdateCustomField={handleUpdateCustomField}
        />
      ) : (
        <div className="grid gap-3" style={gridStyle}>
          {filteredPerformers.map((p) => (
            <PerformerTile key={p.id} performer={p} />
          ))}
        </div>
      )}
    </div>
  );
}
