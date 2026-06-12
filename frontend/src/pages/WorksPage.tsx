import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, ArrowUpDown, Upload, CheckCircle2, XCircle, AlertTriangle, LayoutGrid, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CustomFieldDefinition, ImportRow, WorkColumnKey } from "@/types";
import { useImportFlow } from "@/hooks/useImportFlow";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { WorkTile } from "@/components/WorkTile";
import { WorkTable } from "@/components/WorkTable";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";

const WORKS_STORAGE_KEY = "video-ratings:works-filters";
const WORKS_TABLE_COLUMNS_KEY = "video-ratings:works-table-columns";
const WORKS_VIEW_MODE_KEY = "video-ratings:works-view-mode";
const DEFAULT_WORKS_TABLE_COLUMNS: WorkColumnKey[] = ["maker", "total_score"];

function loadWorksTableColumns(): WorkColumnKey[] {
  try {
    const saved = JSON.parse(localStorage.getItem(WORKS_TABLE_COLUMNS_KEY) ?? "null");
    return Array.isArray(saved) ? saved : DEFAULT_WORKS_TABLE_COLUMNS;
  } catch {
    return DEFAULT_WORKS_TABLE_COLUMNS;
  }
}
const DEFAULT_WORKS_SORT_BY = "created_at";
const DEFAULT_WORKS_SORT_DESC = true;

function loadWorksFilters() {
  try { return JSON.parse(localStorage.getItem(WORKS_STORAGE_KEY) ?? "{}"); }
  catch { return {}; }
}

function loadWorksViewMode(): "tile" | "table" {
  const saved = localStorage.getItem(WORKS_VIEW_MODE_KEY);
  if (saved === "tile" || saved === "table") {
    return saved;
  }
  return "tile";
}

function defaultSortDescForFieldType(fieldType: CustomFieldDefinition["field_type"]): boolean {
  return fieldType !== "text";
}

export default function WorksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useDocumentTitle("作品一覧");

  const stored = loadWorksFilters();
  const [keyword, setKeyword] = useState<string>(stored.keyword ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(stored.selectedTagIds ?? []);
  const [maker, setMaker] = useState<string>(stored.maker ?? "");
  const [series, setSeries] = useState<string>(stored.series ?? "");
  const [sortBy, setSortBy] = useState<string>(stored.sortBy ?? DEFAULT_WORKS_SORT_BY);
  const [sortDesc, setSortDesc] = useState<boolean>(stored.sortDesc ?? DEFAULT_WORKS_SORT_DESC);
  const [onlyUnrated, setOnlyUnrated] = useState<boolean>(stored.onlyUnrated ?? false);
  const [onlyNoCover, setOnlyNoCover] = useState<boolean>(stored.onlyNoCover ?? false);
  const [onlyNoFiles, setOnlyNoFiles] = useState<boolean>(stored.onlyNoFiles ?? false);
  const [viewMode, setViewMode] = useState<"tile" | "table">(loadWorksViewMode);
  const [visibleWorkColumns, setVisibleWorkColumns] = useState<WorkColumnKey[]>(loadWorksTableColumns);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMaker, setNewMaker] = useState("");
  const [newSeries, setNewSeries] = useState("");
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const { maxCols } = useTileMaxColumns();
  const gridStyle = useTileGridStyle(maxCols);

  const filterParams = { keyword, maker, series, selectedTagIds, sortBy, sortDesc };

  const { data: works = [] } = useQuery({
    queryKey: ["works", filterParams],
    queryFn: () => {
      const params: Record<string, string | number | boolean | string[]> = {
        sort_by: sortBy,
        sort_desc: sortDesc,
      };
      if (keyword) params.keyword = keyword;
      if (maker) params.maker = maker;
      if (series) params.series = series;
      if (selectedTagIds.length) params.tag_ids = selectedTagIds.map(String);
      return api.works.search(params);
    },
  });

  useEffect(() => {
    localStorage.setItem(WORKS_STORAGE_KEY, JSON.stringify({
      keyword, selectedTagIds, maker, series, sortBy, sortDesc,
      onlyUnrated, onlyNoCover, onlyNoFiles,
    }));
  }, [keyword, selectedTagIds, maker, series, sortBy, sortDesc, onlyUnrated, onlyNoCover, onlyNoFiles]);

  useEffect(() => {
    localStorage.setItem(WORKS_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const { data: categories = [] } = useQuery({
    queryKey: ["tagCategories", "work"],
    queryFn: () => api.tagCategories.list("work"),
  });

  const { data: customFieldDefs = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["customFields", "work"],
    queryFn: () => api.customFields.list("work"),
  });

  const sortableCustomFields = customFieldDefs.filter((d) => d.is_sortable);

  const createWorkMutation = useMutation({
    mutationFn: (data: { title: string; maker?: string; series?: string }) =>
      api.works.create(data),
    onSuccess: (work) => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      setCreateOpen(false);
      setNewTitle("");
      setNewMaker("");
      setNewSeries("");
      navigate(`/works/${work.id}`);
    },
  });

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["works"] });
  };

  const {
    importPhase,
    setImportPhase,
    confirmRowNumbers,
    setConfirmRowNumbers,
    importPreview,
    importRowStates,
    importResult,
    importLoading,
    importDragOver,
    setImportDragOver,
    importCount,
    handleImportFile,
    toggleImportRowSkipped,
    toggleImportPerformerOverride,
    executeImport,
    resetImport,
    selectAllImport,
    deselectAllImport,
  } = useImportFlow(handleImportComplete);

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
    setOnlyUnrated(false);
    setOnlyNoCover(false);
    setOnlyNoFiles(false);
    setSortBy(DEFAULT_WORKS_SORT_BY);
    setSortDesc(DEFAULT_WORKS_SORT_DESC);
    localStorage.removeItem(WORKS_STORAGE_KEY);
  };

  const toggleWorkColumn = (key: WorkColumnKey) => {
    const next = visibleWorkColumns.includes(key)
      ? visibleWorkColumns.filter((k) => k !== key)
      : [...visibleWorkColumns, key];
    setVisibleWorkColumns(next);
    localStorage.setItem(WORKS_TABLE_COLUMNS_KEY, JSON.stringify(next));
  };

  const handleWorkTableSort = (key: string) => {
    if (sortBy === key) {
      setSortDesc((d) => !d);
    } else {
      setSortBy(key);
      setSortDesc(key !== "created_at");
    }
  };

  const filteredWorks = useMemo(() => {
    let result = works;
    if (onlyUnrated) result = result.filter((w) => w.tags.length === 0);
    if (onlyNoCover) result = result.filter((w) => w.cover_image_url === null);
    if (onlyNoFiles) result = result.filter((w) => w.file_count === 0);
    return result;
  }, [works, onlyUnrated, onlyNoCover, onlyNoFiles]);

  const hasFilters = !!(keyword || maker || series || selectedTagIds.length > 0 || onlyUnrated || onlyNoCover || onlyNoFiles || sortBy !== DEFAULT_WORKS_SORT_BY || sortDesc !== DEFAULT_WORKS_SORT_DESC);

  const renderImportRows = (rows: ImportRow[]) =>
    rows.map((row) => {
      const isSkipped = importRowStates[row.row_number]?.skipped;
      const rowBg = !row.is_valid ? "bg-destructive/5" : isSkipped ? "bg-muted/30 opacity-60" : "";
      return (
        <tr key={row.row_number} className={`border-t transition-colors ${rowBg}`}>
          <td className="px-3 py-2 text-center">
            {row.is_valid ? (
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 cursor-pointer mx-auto block"
                checked={!isSkipped}
                onChange={() => toggleImportRowSkipped(row.row_number)}
              />
            ) : (
              <span title={row.errors?.join("\n")}>
                <XCircle size={16} className="text-destructive mx-auto cursor-help" />
              </span>
            )}
          </td>
          <td className="px-3 py-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{row.title ?? <span className="text-muted-foreground">—</span>}</span>
              {row.is_duplicate_suspect && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium bg-amber-50 px-1 py-0.5 rounded whitespace-nowrap">
                  <AlertTriangle size={9} />重複の可能性
                </span>
              )}
            </div>
          </td>
          <td className="px-3 py-2">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {(row.performers || []).map((p, i) => {
                const isOverride = importRowStates[row.row_number]?.performerOverrides?.[p.name] || false;
                const isMatched = p.existing_id !== null;
                const displayText = p.existing_name
                  ? p.existing_aliases?.length
                    ? `${p.existing_name} (${p.existing_aliases.join(", ")})`
                    : p.existing_name
                  : p.name;
                return (
                  <div key={i} className="inline-flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded text-xs border border-border">
                    {isMatched && !isOverride ? (
                      <>
                        <span className="text-green-700">{displayText}</span>
                        <button type="button" className="text-[10px] text-muted-foreground underline border-l border-border pl-1" onClick={() => toggleImportPerformerOverride(row.row_number, p.name)}>別人</button>
                      </>
                    ) : isMatched && isOverride ? (
                      <>
                        <span className="text-amber-600">{p.name} [新規]</span>
                        <button type="button" className="text-[10px] text-muted-foreground underline border-l border-border pl-1" onClick={() => toggleImportPerformerOverride(row.row_number, p.name)}>戻す</button>
                      </>
                    ) : (
                      <span>{p.name} <span className="text-muted-foreground">[新規]</span></span>
                    )}
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      );
    });

  const closeBulkImport = () => { setBulkImportOpen(false); resetImport(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">作品一覧</h1>
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
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
            <Upload size={16} />一括登録
          </Button>
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
                <Button
                  onClick={() => createWorkMutation.mutate({ title: newTitle, maker: newMaker || undefined, series: newSeries || undefined })}
                  disabled={!newTitle.trim()}
                  className="w-full"
                >登録する</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 一括登録モーダル */}
      <Dialog open={bulkImportOpen} onOpenChange={closeBulkImport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>CSVで一括登録</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            CSVファイルから作品を一括登録します。列: <code>title</code>, <code>performer_names</code>（カンマ区切り）, <code>performer_furiganas</code>（任意）, <code>directory_path</code>（任意）
          </p>

          {importPhase === "upload" && (
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                importDragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => { e.preventDefault(); setImportDragOver(true); }}
              onDragLeave={() => setImportDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setImportDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleImportFile(file);
              }}
            >
              <Upload size={36} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">CSVファイルをドロップ、または</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }}
                />
                <Button variant="outline" asChild><span>ファイルを選択</span></Button>
              </label>
            </div>
          )}

          {importLoading && <div className="text-center text-muted-foreground py-4">読み込み中…</div>}

          {importPhase === "preview" && importPreview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">全 {importPreview.rows.length} 行 / インポート対象 {importCount} 件 / エラー {importPreview.error_count} 件</span>
                <div className="flex gap-2 ml-auto flex-wrap">
                  <Button variant="outline" size="sm" onClick={selectAllImport}>全選択</Button>
                  <Button variant="outline" size="sm" onClick={deselectAllImport}>全解除</Button>
                  <Button variant="outline" onClick={resetImport}>キャンセル</Button>
                  <Button
                    onClick={() => {
                      setConfirmRowNumbers(new Set(
                        importPreview.rows
                          .filter((r) => r.is_valid && !importRowStates[r.row_number]?.skipped)
                          .map((r) => r.row_number)
                      ));
                      setImportPhase("confirm");
                    }}
                    disabled={importCount === 0}
                  >
                    確認へ →（{importCount}件）
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="w-16 px-3 py-2 text-center">取り込む</th>
                      <th className="text-left px-3 py-2">作品名</th>
                      <th className="text-left px-3 py-2">出演者</th>
                    </tr>
                  </thead>
                  <tbody>{renderImportRows(importPreview.rows)}</tbody>
                </table>
              </div>
            </div>
          )}

          {importPhase === "confirm" && importPreview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium">
              {[...confirmRowNumbers].filter((n) => !importRowStates[n]?.skipped).length}件をインポートします
            </span>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setImportPhase("preview")}>← 戻る</Button>
                  <Button onClick={executeImport} disabled={[...confirmRowNumbers].filter((n) => !importRowStates[n]?.skipped).length === 0 || importLoading}>
                    インポート実行
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="w-16 px-3 py-2 text-center">取り込む</th>
                      <th className="text-left px-3 py-2">作品名</th>
                      <th className="text-left px-3 py-2">出演者</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderImportRows(
                      importPreview.rows.filter((r) => confirmRowNumbers.has(r.row_number))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importPhase === "result" && importResult && (
            <div className="space-y-4">
              <div className="rounded-lg border p-6 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-green-500" />
                <p className="font-semibold text-lg">{importResult.created_count}件をインポートしました</p>
                {importResult.skipped_count > 0 && <p className="text-muted-foreground text-sm">{importResult.skipped_count}件をスキップ</p>}
                {importResult.errors.length > 0 && (
                  <ul className="text-destructive text-sm text-left space-y-1 mt-2">
                    {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={resetImport} variant="outline" className="flex-1">続けてインポートする</Button>
                <Button onClick={closeBulkImport} className="flex-1">閉じる</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Search & Filters */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              className="pl-9 h-11"
              placeholder="作品名・出演者・メーカー・シリーズで検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <Input className="w-40 h-11" placeholder="メーカー" value={maker} onChange={(e) => setMaker(e.target.value)} />
          <Input className="w-40 h-11" placeholder="シリーズ" value={series} onChange={(e) => setSeries(e.target.value)} />
          {hasFilters && (
            <Button variant="outline" onClick={resetFilters}><X size={16} />フィルタ全解除</Button>
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
                  className="cursor-pointer py-1.5"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}{tag.score != null ? ` (+${tag.score})` : ""}
                </Badge>
              ))}
            </div>
          </div>
        ))}

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
          <Badge
            variant={onlyNoFiles ? "default" : "outline"}
            className="cursor-pointer py-1.5"
            onClick={() => setOnlyNoFiles((v) => !v)}
          >
            ファイルなし
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredWorks.length} 件</span>
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
          {sortableCustomFields.map((cf) => {
            const key = `custom:${cf.name}`;
            return (
              <Button
                key={cf.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (sortBy === key) setSortDesc((d) => !d);
                  else { setSortBy(key); setSortDesc(defaultSortDescForFieldType(cf.field_type)); }
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
                  { key: "maker" as WorkColumnKey, label: "メーカー" },
                  { key: "series" as WorkColumnKey, label: "シリーズ" },
                  { key: "total_score" as WorkColumnKey, label: "スコア" },
                  { key: "tags" as WorkColumnKey, label: "タグ" },
                  { key: "file_count" as WorkColumnKey, label: "ファイル数" },
                  { key: "created_at" as WorkColumnKey, label: "登録日" },
                ] as { key: WorkColumnKey; label: string }[]
              ).map(({ key, label }) => (
                <Badge
                  key={key}
                  variant={visibleWorkColumns.includes(key) ? "default" : "outline"}
                  className="cursor-pointer py-1.5"
                  onClick={() => toggleWorkColumn(key)}
                >
                  {label}
                </Badge>
              ))}
              {customFieldDefs.map((cf) => {
                const key = `custom:${cf.name}` as WorkColumnKey;
                return (
                  <Badge
                    key={cf.id}
                    variant={visibleWorkColumns.includes(key) ? "default" : "outline"}
                    className="cursor-pointer py-1.5"
                    onClick={() => toggleWorkColumn(key)}
                  >
                    {cf.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredWorks.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">作品が見つかりません</p>
      ) : viewMode === "table" ? (
        <WorkTable
          works={filteredWorks}
          visibleColumns={visibleWorkColumns}
          customFieldDefs={customFieldDefs}
          sortBy={sortBy}
          sortDesc={sortDesc}
          onSort={handleWorkTableSort}
        />
      ) : (
        <div className="grid gap-3" style={gridStyle}>
          {filteredWorks.map((w) => (
            <WorkTile key={w.id} work={w} />
          ))}
        </div>
      )}
    </div>
  );
}
