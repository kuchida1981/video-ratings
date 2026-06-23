import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Search, X, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CustomFieldDefinition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { WorkTile } from "@/components/WorkTile";
import { CoverUploadZone } from "@/components/CoverUploadZone";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/contexts/AuthContext";

const PERFORMER_WORKS_SORT_KEY = "video-ratings:performer-detail-works-sort";

function loadWorksSort(): { sortBy: string; sortDesc: boolean } {
  try {
    const stored = JSON.parse(localStorage.getItem(PERFORMER_WORKS_SORT_KEY) ?? "{}");
    return {
      sortBy: typeof stored.sortBy === "string" ? stored.sortBy : "created_at",
      sortDesc: typeof stored.sortDesc === "boolean" ? stored.sortDesc : true,
    };
  } catch {
    return { sortBy: "created_at", sortDesc: true };
  }
}

export default function PerformerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const performerId = Number(id);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditor = user?.role === "editor";

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", furigana: "" });
  const [memo, setMemo] = useState("");
  const [initializedId, setInitializedId] = useState<number | null>(null);
  const storedSort = loadWorksSort();
  const [workSortBy, setWorkSortBy] = useState<string>(storedSort.sortBy);
  const [workSortDesc, setWorkSortDesc] = useState<boolean>(storedSort.sortDesc);
  const { maxCols } = useTileMaxColumns();
  const gridStyle = useTileGridStyle(Math.max(2, maxCols - 1));


  const [newAliasName, setNewAliasName] = useState("");
  const [newAliasFurigana, setNewAliasFurigana] = useState("");
  const [editingAliasId, setEditingAliasId] = useState<number | null>(null);
  const [editingAliasName, setEditingAliasName] = useState("");
  const [editingAliasFurigana, setEditingAliasFurigana] = useState("");

  const invalidatePerformer = () => {
    queryClient.invalidateQueries({ queryKey: ["performers", performerId] });
  };

  const { data: performer } = useQuery({
    queryKey: ["performers", performerId],
    queryFn: () => api.performers.get(performerId),
  });
  useDocumentTitle(performer ? performer.name : "出演者詳細");

  const { data: works = [] } = useQuery({
    queryKey: ["performerWorks", performerId, workSortBy, workSortDesc],
    queryFn: () => api.works.search({ performer_id: performerId, sort_by: workSortBy, sort_desc: workSortDesc }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["tagCategories", "performer"],
    queryFn: () => api.tagCategories.list("performer"),
  });

  const { data: customFieldDefs = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["customFields", "performer"],
    queryFn: () => api.customFields.list("performer"),
  });

  const { data: workCustomFieldDefs = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["customFields", "work"],
    queryFn: () => api.customFields.list("work"),
  });

  const sortableWorkCustomFields = workCustomFieldDefs.filter((d) => d.is_sortable);

  useEffect(() => {
    if (performer && editing) setForm({ name: performer.name, furigana: performer.furigana ?? "" });
  }, [editing, performer]);

  useEffect(() => {
    if (performer && customFieldDefs.length > 0) {
      const values: Record<string, string | boolean> = {};
      customFieldDefs.forEach((cf) => {
        const raw = performer.custom_fields?.[cf.name];
        values[cf.name] = cf.field_type === "boolean" ? Boolean(raw) : String(raw ?? "");
      });
      setCustomFieldValues(values);
    }
  }, [performer, customFieldDefs]);

  useEffect(() => {
    if (performer && initializedId !== performer.id) {
      setMemo(performer.memo ?? "");
      setInitializedId(performer.id);
    }
  }, [performer, initializedId]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; furigana?: string }) =>
      api.performers.update(performerId, data),
    onSuccess: () => {
      setEditing(false);
      invalidatePerformer();
    },
  });

  const updateMemoMutation = useMutation({
    mutationFn: (memoValue: string) =>
      api.performers.update(performerId, { memo: memoValue === "" ? null : memoValue }),
    onSuccess: () => {
      invalidatePerformer();
    },
  });

  const handleMemoBlur = () => {
    const originalMemo = performer?.memo ?? "";
    if (memo !== originalMemo) {
      updateMemoMutation.mutate(memo);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: () => api.performers.delete(performerId),
    onSuccess: () => navigate("/performers"),
  });

  const addAliasMutation = useMutation({
    mutationFn: (data: { name: string; furigana: string | null }) =>
      api.performers.addAlias(performerId, data),
    onSuccess: () => {
      setNewAliasName("");
      setNewAliasFurigana("");
      invalidatePerformer();
    },
    onError: (e) => alert(e instanceof Error ? e.message : "別名の追加に失敗しました"),
  });

  const updateAliasMutation = useMutation({
    mutationFn: ({ aliasId, data }: { aliasId: number; data: { name: string; furigana: string | null } }) =>
      api.performers.updateAlias(performerId, aliasId, data),
    onSuccess: () => {
      setEditingAliasId(null);
      invalidatePerformer();
    },
    onError: (e) => alert(e instanceof Error ? e.message : "別名の更新に失敗しました"),
  });

  const removeAliasMutation = useMutation({
    mutationFn: (aliasId: number) => api.performers.removeAlias(performerId, aliasId),
    onSuccess: () => invalidatePerformer(),
    onError: (e) => alert(e instanceof Error ? e.message : "別名の削除に失敗しました"),
  });

  const toggleTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      if (!performer) return;
      const has = performer.tags.some((t) => t.id === tagId);
      if (has) await api.performers.removeTag(performerId, tagId);
      else await api.performers.addTag(performerId, tagId);
    },
    onSuccess: () => invalidatePerformer(),
  });

  const updateCustomFieldMutation = useMutation({
    mutationFn: ({ name, value }: { name: string; value: string | number | boolean | null }) =>
      api.performers.updateCustomFields(performerId, { [name]: value }),
    onSuccess: () => invalidatePerformer(),
  });

  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => api.performers.uploadCover(performerId, file),
    onSuccess: () => invalidatePerformer(),
  });

  const deleteCoverMutation = useMutation({
    mutationFn: () => api.performers.deleteCover(performerId),
    onSuccess: () => invalidatePerformer(),
  });

  if (!performer) return <div className="text-muted-foreground">読み込み中…</div>;

  return (
    <div className="space-y-6">
    <div className="max-w-2xl space-y-6">
      {/* カバー画像 */}
      <section className="space-y-2">
        {performer.cover_image_url ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <img src={performer.cover_image_url} alt={performer.name} className="w-full h-full object-cover" />
            {isEditor && (
              <button
                onClick={() => { if (confirm("カバー画像を削除しますか？")) deleteCoverMutation.mutate(); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          isEditor && <CoverUploadZone onUpload={uploadCoverMutation.mutate} />
        )}
      </section>

      <div className="flex items-start justify-between">
        <div>
          {editing && isEditor ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div><Label>名前</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>ふりがな</Label><Input value={form.furigana} onChange={(e) => setForm({ ...form, furigana: e.target.value })} /></div>
                <div className="flex gap-2">
                  <Button onClick={() => updateMutation.mutate({ name: form.name, furigana: form.furigana || undefined })}>保存</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>キャンセル</Button>
                </div>
              </div>

              {/* 別名管理セクション */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="text-sm font-semibold">別名管理</h3>

                {/* 既存の別名リスト */}
                <div className="space-y-2">
                  {(performer.aliases ?? []).map((alias) => (
                    <div key={alias.id} className="flex items-center gap-2 text-sm border p-2 rounded bg-muted/30">
                      {editingAliasId === alias.id ? (
                        <>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="名前"
                              value={editingAliasName}
                              onChange={(e) => setEditingAliasName(e.target.value)}
                            />
                            <Input
                              placeholder="ふりがな"
                              value={editingAliasFurigana}
                              onChange={(e) => setEditingAliasFurigana(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => updateAliasMutation.mutate({ aliasId: alias.id, data: { name: editingAliasName.trim(), furigana: editingAliasFurigana.trim() || null } })}>保存</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingAliasId(null)}>キャンセル</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="font-medium">{alias.name}</span>
                            {alias.furigana && <span className="text-muted-foreground text-xs ml-2">({alias.furigana})</span>}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAliasId(alias.id);
                                setEditingAliasName(alias.name);
                                setEditingAliasFurigana(alias.furigana ?? "");
                              }}
                            >
                              編集
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { if (confirm("この別名を削除しますか？")) removeAliasMutation.mutate(alias.id); }}>
                              削除
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {(performer.aliases ?? []).length === 0 && (
                    <div className="text-xs text-muted-foreground italic">登録されている別名はありません。</div>
                  )}
                </div>

                {/* 新規追加フォーム */}
                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-xs font-medium text-muted-foreground">別名の新規追加</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="別名（必須）"
                      value={newAliasName}
                      onChange={(e) => setNewAliasName(e.target.value)}
                    />
                    <Input
                      placeholder="ふりがな（任意）"
                      value={newAliasFurigana}
                      onChange={(e) => setNewAliasFurigana(e.target.value)}
                    />
                    <Button onClick={() => { if (!newAliasName.trim()) return; addAliasMutation.mutate({ name: newAliasName.trim(), furigana: newAliasFurigana.trim() || null }); }}>追加</Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{performer.name}</h1>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`"${performer.name}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Search size={16} />
                </a>
              </div>
              {performer.furigana && <div className="text-sm text-muted-foreground">{performer.furigana}</div>}
              {performer.aliases && performer.aliases.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-muted-foreground">別名:</span>
                  {performer.aliases.map((alias) => (
                    <Badge key={alias.id} variant="secondary" className="text-xs py-0">
                      {alias.name}
                      {alias.furigana && <span className="text-[10px] opacity-70 ml-1">({alias.furigana})</span>}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-2xl font-bold text-primary">{performer.total_score}点</div>
          {isEditor && (
            <>
              {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>編集</Button>}
              <Button variant="destructive" size="sm" onClick={() => { if (confirm("この出演者を削除しますか？")) deleteMutation.mutate(); }}><Trash2 size={14} /></Button>
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <section className="space-y-2">
        <h2 className="font-semibold">評価タグ</h2>
        {categories.map((cat) => {
          const activeTags = cat.tags.filter((tag) => performer.tags.some((t) => t.id === tag.id));
          const tagsToRender = isEditor ? cat.tags : activeTags;
          if (!isEditor && activeTags.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                <span>{cat.name}</span>
                {cat.description && <span className="opacity-60 font-normal">({cat.description})</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {tagsToRender.map((tag) => (
                  <div key={tag.id} className="group relative">
                    <Badge
                      variant={performer.tags.some((t) => t.id === tag.id) ? "default" : "outline"}
                      className={isEditor ? "cursor-pointer" : ""}
                      onClick={() => isEditor && toggleTagMutation.mutate(tag.id)}
                    >
                      {tag.name}{tag.score != null ? ` +${tag.score}` : ""}
                    </Badge>
                    {tag.description && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground border shadow-md text-[10px] rounded px-2 py-1 mb-1 whitespace-nowrap z-50">
                        {tag.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Custom Fields */}
      {customFieldDefs.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">カスタム項目</h2>
          <div className="grid grid-cols-2 gap-3">
            {customFieldDefs.map((cf) => (
              <div key={cf.id}>
                <Label className="text-xs">{cf.name}</Label>
                {isEditor ? (
                  cf.field_type === "boolean" ? (
                    <div className="flex items-center h-9">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={Boolean(customFieldValues[cf.name])}
                        onChange={(e) => {
                          setCustomFieldValues((prev) => ({ ...prev, [cf.name]: e.target.checked }));
                          updateCustomFieldMutation.mutate({ name: cf.name, value: e.target.checked });
                        }}
                      />
                    </div>
                  ) : (
                    <Input
                      type={cf.field_type === "number" ? "number" : cf.field_type === "date" ? "date" : "text"}
                      value={String(customFieldValues[cf.name] ?? "")}
                      onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [cf.name]: e.target.value }))}
                      onBlur={(e) => {
                        const raw = e.target.value;
                        const value = raw === "" ? null : cf.field_type === "number" ? Number(raw) : raw;
                        updateCustomFieldMutation.mutate({ name: cf.name, value: value as string | number | null });
                      }}
                    />
                  )
                ) : (
                  <div className="flex items-center h-9 text-sm">
                    {cf.field_type === "boolean" ? (
                      customFieldValues[cf.name] ? "はい" : "いいえ"
                    ) : (
                      String(customFieldValues[cf.name] ?? "—") || "—"
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Memo */}
      <section className="space-y-2">
        <h2 className="font-semibold">メモ</h2>
        {isEditor ? (
          <Textarea
            placeholder="メモを入力..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={handleMemoBlur}
            className="min-h-[120px]"
          />
        ) : (
          <div className="border rounded-md p-3 text-sm min-h-[120px] whitespace-pre-wrap bg-muted/10">
            {performer.memo || <span className="text-muted-foreground">メモはありません</span>}
          </div>
        )}
      </section>

      </div>

      {/* Works — full width */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-1">
          <h2 className="font-semibold mr-2">出演作品 ({works.length})</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newBy = "total_score";
              const newDesc = workSortBy === newBy ? !workSortDesc : true;
              setWorkSortBy(newBy); setWorkSortDesc(newDesc);
              localStorage.setItem(PERFORMER_WORKS_SORT_KEY, JSON.stringify({ sortBy: newBy, sortDesc: newDesc }));
            }}
            className={workSortBy === "total_score" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />スコア順
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newBy = "created_at";
              const newDesc = workSortBy === newBy ? !workSortDesc : true;
              setWorkSortBy(newBy); setWorkSortDesc(newDesc);
              localStorage.setItem(PERFORMER_WORKS_SORT_KEY, JSON.stringify({ sortBy: newBy, sortDesc: newDesc }));
            }}
            className={workSortBy === "created_at" ? "text-primary" : ""}
          >
            <ArrowUpDown size={14} />登録日順
          </Button>
          {sortableWorkCustomFields.map((cf) => {
            const key = `custom:${cf.name}`;
            const defaultDesc = cf.field_type !== "text";
            return (
              <Button
                key={cf.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDesc = workSortBy === key ? !workSortDesc : defaultDesc;
                  setWorkSortBy(key); setWorkSortDesc(newDesc);
                  localStorage.setItem(PERFORMER_WORKS_SORT_KEY, JSON.stringify({ sortBy: key, sortDesc: newDesc }));
                }}
                className={workSortBy === key ? "text-primary" : ""}
              >
                <ArrowUpDown size={14} />{cf.name}
              </Button>
            );
          })}
        </div>
        {works.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">出演作品なし</p>
        ) : (
          <div className="grid gap-3" style={gridStyle}>
            {works.map((w) => (
              <WorkTile key={w.id} work={w} onClick={() => navigate(`/works/${w.id}`)} variant="default" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
