import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Plus, Star, UserCheck, Search, Play, X, ImagePlus, Pencil, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CoverUploadZone } from "@/components/CoverUploadZone";
import { api } from "@/api/client";
import type { TagCategory, WorkFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function processImageFile(file: File, onUpload: (file: File) => void) {
  if (!file.type.startsWith("image/")) return;
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  img.onerror = () => { URL.revokeObjectURL(objectUrl); onUpload(file); };
  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    const MAX_WIDTH = 1200;
    let width = img.width;
    let height = img.height;
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => onUpload(blob ? new File([blob], "image.jpg", { type: "image/jpeg" }) : file),
        "image/jpeg",
        0.85
      );
    } else {
      onUpload(file);
    }
  };
  img.src = objectUrl;
}

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workId = Number(id);
  const queryClient = useQueryClient();

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [performerCFValues, setPerformerCFValues] = useState<Record<number, Record<string, string | boolean>>>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", maker: "", series: "" });
  const [newFilePath, setNewFilePath] = useState("");
  const [memo, setMemo] = useState("");
  const [initializedId, setInitializedId] = useState<number | null>(null);
  const [newFileDisplayName, setNewFileDisplayName] = useState("");
  const [addPerformerId, setAddPerformerId] = useState("");
  const [playingFileId, setPlayingFileId] = useState<number | null>(null);
  const [playingFile, setPlayingFile] = useState<WorkFile | null>(null);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editFileForm, setEditFileForm] = useState({ path: "", display_name: "" });
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [coverFocused, setCoverFocused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isSmbUrl = (path: string) => path.startsWith("smb://");

  const invalidateWork = () => {
    queryClient.invalidateQueries({ queryKey: ["works", workId] });
    queryClient.invalidateQueries({ queryKey: ["works"] });
  };

  const { data: work } = useQuery({
    queryKey: ["works", workId],
    queryFn: () => api.works.get(workId),
  });
  useDocumentTitle(work ? work.title : "作品詳細");

  const { data: categories = [] } = useQuery({
    queryKey: ["tagCategories", "work"],
    queryFn: () => api.tagCategories.list("work"),
  });

  const { data: performerCategories = [] } = useQuery({
    queryKey: ["tagCategories", "performer"],
    queryFn: () => api.tagCategories.list("performer"),
  });

  const { data: allPerformers = [] } = useQuery({
    queryKey: ["performers"],
    queryFn: () => api.performers.list(),
  });

  const { data: customFields = [] } = useQuery({
    queryKey: ["customFields", "work"],
    queryFn: () => api.customFields.list("work"),
  });

  const { data: performerCFDefs = [] } = useQuery({
    queryKey: ["customFields", "performer"],
    queryFn: () => api.customFields.list("performer"),
  });

  useEffect(() => {
    if (work && editing) setForm({ title: work.title, maker: work.maker ?? "", series: work.series ?? "" });
  }, [editing, work]);

  useEffect(() => {
    if (work && customFields.length > 0) {
      const values: Record<string, string | boolean> = {};
      customFields.forEach((cf) => {
        const raw = work.custom_fields?.[cf.name];
        values[cf.name] = cf.field_type === "boolean" ? Boolean(raw) : String(raw ?? "");
      });
      setCustomFieldValues(values);
    }
  }, [work, customFields]);

  useEffect(() => {
    if (work && initializedId !== work.id) {
      setMemo(work.memo ?? "");
      setInitializedId(work.id);
    }
  }, [work, initializedId]);

  useEffect(() => {
    if (!playingFile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
  }, [playingFile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => setPlayingFile(null);
    const onDocChange = () => {
      const isFullscreen = document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      if (!isFullscreen) setPlayingFile(null);
    };
    video.addEventListener("webkitendfullscreen", onEnd);
    document.addEventListener("fullscreenchange", onDocChange);
    document.addEventListener("webkitfullscreenchange", onDocChange);
    return () => {
      video.removeEventListener("webkitendfullscreen", onEnd);
      document.removeEventListener("fullscreenchange", onDocChange);
      document.removeEventListener("webkitfullscreenchange", onDocChange);
    };
  }, []);

  useEffect(() => {
    if (work && performerCFDefs.length > 0) {
      const values: Record<number, Record<string, string | boolean>> = {};
      work.performers.forEach((p) => {
        values[p.id] = {};
        performerCFDefs.forEach((cf) => {
          const raw = p.custom_fields?.[cf.name];
          values[p.id][cf.name] = cf.field_type === "boolean" ? Boolean(raw) : String(raw ?? "");
        });
      });
      setPerformerCFValues(values);
    }
  }, [work, performerCFDefs]);

  useEffect(() => {
    if (!coverFocused) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) processImageFile(file, uploadCoverMutation.mutate);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverFocused]);

  const updateWorkMutation = useMutation({
    mutationFn: (data: { title: string; maker?: string; series?: string }) =>
      api.works.update(workId, data),
    onSuccess: () => {
      setEditing(false);
      invalidateWork();
    },
  });

  const updateMemoMutation = useMutation({
    mutationFn: (memoValue: string) =>
      api.works.update(workId, { memo: memoValue === "" ? null : memoValue }),
    onSuccess: () => {
      invalidateWork();
    },
  });

  const handleMemoBlur = () => {
    const originalMemo = work?.memo ?? "";
    if (memo !== originalMemo) {
      updateMemoMutation.mutate(memo);
    }
  };

  const deleteWorkMutation = useMutation({
    mutationFn: () => api.works.delete(workId),
    onSuccess: () => navigate("/works"),
  });

  const addFileMutation = useMutation({
    mutationFn: (data: { path: string; display_name?: string }) =>
      api.works.addFile(workId, data),
    onSuccess: () => {
      setNewFilePath("");
      setNewFileDisplayName("");
      invalidateWork();
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, data }: { fileId: number; data: { path: string; display_name: string | null } }) =>
      api.works.updateFile(workId, fileId, data),
    onSuccess: () => {
      setEditingFileId(null);
      invalidateWork();
    },
  });

  const removeFileMutation = useMutation({
    mutationFn: (fileId: number) => api.works.removeFile(workId, fileId),
    onSuccess: () => invalidateWork(),
  });

  const addPerformerMutation = useMutation({
    mutationFn: (performerId: number) => api.works.addPerformer(workId, { performer_id: performerId }),
    onSuccess: () => {
      setAddPerformerId("");
      invalidateWork();
    },
  });

  const removePerformerMutation = useMutation({
    mutationFn: (performerId: number) => api.works.removePerformer(workId, performerId),
    onSuccess: () => invalidateWork(),
  });

  const setMainPerformerMutation = useMutation({
    mutationFn: (performerId: number) => api.works.setMainPerformer(workId, performerId, true),
    onSuccess: () => invalidateWork(),
  });

  const toggleTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      if (!work) return;
      const has = work.tags.some((t) => t.id === tagId);
      if (has) await api.works.removeTag(workId, tagId);
      else await api.works.addTag(workId, tagId);
    },
    onSuccess: () => invalidateWork(),
  });

  const togglePerformerTagMutation = useMutation({
    mutationFn: async ({ performer, tagId, cat }: { performer: NonNullable<typeof work>["performers"][number]; tagId: number; cat: TagCategory }) => {
      const has = performer.tags.some((t) => t.id === tagId);
      if (has) {
        await api.performers.removeTag(performer.id, tagId);
      } else {
        if (!cat.is_multi_select) {
          const existing = performer.tags.find((t) => t.category_id === cat.id);
          if (existing) await api.performers.removeTag(performer.id, existing.id);
        }
        await api.performers.addTag(performer.id, tagId);
      }
    },
    onSuccess: () => invalidateWork(),
  });

  const updatePerformerCFMutation = useMutation({
    mutationFn: ({ performerId, name, value }: { performerId: number; name: string; value: string | boolean }) =>
      api.performers.updateCustomFields(performerId, { [name]: value === "" ? null : value }),
    onSuccess: () => invalidateWork(),
  });

  const updateCustomFieldMutation = useMutation({
    mutationFn: ({ name, value }: { name: string; value: string | boolean }) =>
      api.works.updateCustomFields(workId, { [name]: value === "" ? null : value }),
    onSuccess: () => invalidateWork(),
  });

  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => api.works.uploadCover(workId, file),
    onSuccess: () => invalidateWork(),
  });

  const deleteCoverMutation = useMutation({
    mutationFn: () => api.works.deleteCover(workId),
    onSuccess: () => invalidateWork(),
  });

  if (!work) return <div className="text-muted-foreground">読み込み中…</div>;

  const smbFiles = work.files.filter((f) => isSmbUrl(f.path));

  const handlePlay = (file: WorkFile) => {
    setPlayingFile(file);
    const video = videoRef.current;
    if (!video) return;
    video.src = `/api/works/${workId}/files/${file.id}/stream`;
    video.load();
    video.play().then(() => {
      const v = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
      if (v.webkitEnterFullscreen) {
        v.webkitEnterFullscreen();
      } else {
        video.requestFullscreen?.();
      }
    }).catch(() => {});
  };

  const availablePerformers = allPerformers.filter(
    (p) => !work.performers.some((wp) => wp.id === p.id)
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* カバー画像 */}
      <section className="space-y-2">
        {(work.cover_image_url || smbFiles.length > 0) && (
          <div
            className={`relative aspect-video rounded-lg overflow-hidden border bg-black${!work.cover_image_url && coverDragOver ? " border-primary" : ""}`}
            tabIndex={!work.cover_image_url ? 0 : undefined}
            onFocus={!work.cover_image_url ? () => setCoverFocused(true) : undefined}
            onBlur={!work.cover_image_url ? () => setCoverFocused(false) : undefined}
            onDragOver={!work.cover_image_url ? (e) => { e.preventDefault(); setCoverDragOver(true); } : undefined}
            onDragLeave={!work.cover_image_url ? () => setCoverDragOver(false) : undefined}
            onDrop={!work.cover_image_url ? (e) => {
              e.preventDefault();
              setCoverDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) processImageFile(file, uploadCoverMutation.mutate);
            } : undefined}
          >
            {work.cover_image_url && (
              <img src={work.cover_image_url} alt={work.title} className="w-full h-full object-cover" />
            )}
            {work.cover_image_url ? (
              <button
                onClick={() => deleteCoverMutation.mutate()}
                className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                  title="カバー画像を設定（D&D・Ctrl+Vも使用可）"
                >
                  <ImagePlus size={14} />
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file, uploadCoverMutation.mutate);
                    e.target.value = "";
                  }}
                />
              </>
            )}
            {smbFiles.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
                {smbFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handlePlay(f)}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors"
                  >
                    <Play size={20} className="fill-white shrink-0" />
                    <span className="truncate max-w-xs">
                      {f.display_name ?? f.path.split("/").pop()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!work.cover_image_url && smbFiles.length === 0 && (
          <CoverUploadZone onUpload={uploadCoverMutation.mutate} />
        )}
        <video
          ref={videoRef}
          className="sr-only"
        />
      </section>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {editing ? (
            <div className="space-y-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="text-xl font-bold h-auto text-xl" />
              <div className="flex gap-2">
                <Input placeholder="メーカー" value={form.maker} onChange={(e) => setForm({ ...form, maker: e.target.value })} />
                <Input placeholder="シリーズ" value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateWorkMutation.mutate({ title: form.title, maker: form.maker || undefined, series: form.series || undefined })}>保存</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>キャンセル</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{work.title}</h1>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    [...work.performers.map((p) => `"${p.name}"`), `"${work.title}"`].join(" ")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Search size={16} />
                </a>
              </div>
              <div className="text-sm text-muted-foreground mt-1 space-x-3">
                {work.maker && <span>{work.maker}</span>}
                {work.series && <span>{work.series}</span>}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-2xl font-bold text-primary">{work.total_score}点</div>
          {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>編集</Button>}
          <Button variant="destructive" size="sm" onClick={() => { if (confirm("この作品を削除しますか？")) deleteWorkMutation.mutate(); }}><Trash2 size={14} /></Button>
        </div>
      </div>

      {/* Performers */}
      <section className="space-y-3">
        <h2 className="font-semibold">出演者</h2>
        {work.performers.map((p) => (
          <div key={p.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {p.is_main && <Star size={13} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                <span
                  className="font-medium cursor-pointer hover:text-primary"
                  onClick={() => navigate(`/performers/${p.id}`)}
                >
                  {p.name}
                </span>
                <span className="text-sm text-primary font-mono">{p.total_score}点</span>
              </div>
              <div className="flex items-center gap-1">
                {!p.is_main && (
                  <button
                    className="text-muted-foreground hover:text-yellow-500"
                    onClick={() => setMainPerformerMutation.mutate(p.id)}
                    title="主演に設定"
                  >
                    <UserCheck size={14} />
                  </button>
                )}
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removePerformerMutation.mutate(p.id)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            {performerCategories.map((cat) => (
              <div key={cat.id}>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                  <span>{cat.name}</span>
                  {cat.description && <span className="opacity-60">({cat.description})</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {cat.tags.map((tag) => (
                    <div key={tag.id} className="group relative">
                      <Badge
                        variant={p.tags.some((t) => t.id === tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePerformerTagMutation.mutate({ performer: p, tagId: tag.id, cat })}
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
            ))}
            {performerCFDefs.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {performerCFDefs.map((cf) => (
                  <div key={cf.id}>
                    <Label className="text-xs">{cf.name}</Label>
                    {cf.field_type === "boolean" ? (
                      <div className="flex items-center h-9">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={Boolean(performerCFValues[p.id]?.[cf.name])}
                          onChange={(e) => {
                            setPerformerCFValues((prev) => ({
                              ...prev,
                              [p.id]: { ...prev[p.id], [cf.name]: e.target.checked },
                            }));
                            updatePerformerCFMutation.mutate({ performerId: p.id, name: cf.name, value: e.target.checked });
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        type={cf.field_type === "number" ? "number" : cf.field_type === "date" ? "date" : "text"}
                        value={String(performerCFValues[p.id]?.[cf.name] ?? "")}
                        onChange={(e) =>
                          setPerformerCFValues((prev) => ({
                            ...prev,
                            [p.id]: { ...prev[p.id], [cf.name]: e.target.value },
                          }))
                        }
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const value = raw === "" ? null : cf.field_type === "number" ? Number(raw) : raw;
                          updatePerformerCFMutation.mutate({ performerId: p.id, name: cf.name, value: value as string | number | null });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {availablePerformers.length > 0 && (
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={addPerformerId}
              onChange={(e) => setAddPerformerId(e.target.value)}
            >
              <option value="">出演者を追加…</option>
              {availablePerformers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.furigana ? ` (${p.furigana})` : ""}</option>
              ))}
            </select>
            <Button size="sm" onClick={() => addPerformerMutation.mutate(Number(addPerformerId))} disabled={!addPerformerId}>追加</Button>
          </div>
        )}
      </section>

      {/* Tags */}
      <section className="space-y-2">
        <h2 className="font-semibold">タグ評価</h2>
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              <span>{cat.name}</span>
              {cat.description && <span className="opacity-60 font-normal">({cat.description})</span>}
            </div>
            <div className="flex flex-wrap gap-1">
              {cat.tags.map((tag) => (
                <div key={tag.id} className="group relative">
                  <Badge
                    variant={work.tags.some((t) => t.id === tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTagMutation.mutate(tag.id)}
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
        ))}
      </section>

      {/* Files */}
      <section className="space-y-2">
        <h2 className="font-semibold">ファイルパス</h2>
        {work.files.map((f) => (
          <div key={f.id}>
            {editingFileId === f.id ? (
              <div className="flex items-center gap-2 text-sm">
                <Input
                  value={editFileForm.path}
                  onChange={(e) => setEditFileForm((p) => ({ ...p, path: e.target.value }))}
                  className="flex-1 h-7 text-xs font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateFileMutation.mutate({ fileId: f.id, data: { path: editFileForm.path, display_name: editFileForm.display_name || null } });
                    } else if (e.key === "Escape") {
                      setEditingFileId(null);
                    }
                  }}
                />
                <Input
                  value={editFileForm.display_name}
                  onChange={(e) => setEditFileForm((p) => ({ ...p, display_name: e.target.value }))}
                  placeholder="表示名"
                  className="w-32 h-7 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateFileMutation.mutate({ fileId: f.id, data: { path: editFileForm.path, display_name: editFileForm.display_name || null } });
                    } else if (e.key === "Escape") {
                      setEditingFileId(null);
                    }
                  }}
                />
                <button
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => updateFileMutation.mutate({ fileId: f.id, data: { path: editFileForm.path, display_name: editFileForm.display_name || null } })}
                >
                  <Check size={14} />
                </button>
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setEditingFileId(null)}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <code className="flex-1 bg-muted px-2 py-1 rounded text-xs">{f.path}</code>
                {f.display_name && <span className="text-muted-foreground">{f.display_name}</span>}
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => { setEditingFileId(f.id); setEditFileForm({ path: f.path, display_name: f.display_name ?? "" }); }}
                  title="編集"
                >
                  <Pencil size={14} />
                </button>
                {isSmbUrl(f.path) && (
                  <button
                    className={`${playingFileId === f.id ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                    onClick={() => setPlayingFileId(playingFileId === f.id ? null : f.id)}
                    title={playingFileId === f.id ? "閉じる" : "再生"}
                  >
                    {playingFileId === f.id ? <X size={14} /> : <Play size={14} />}
                  </button>
                )}
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (playingFileId === f.id) setPlayingFileId(null);
                    removeFileMutation.mutate(f.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            {playingFileId === f.id && (
              <video
                key={f.id}
                controls
                autoPlay
                className="w-full mt-2 rounded"
                src={`/api/works/${workId}/files/${f.id}/stream`}
              />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="smb://server/share/path/file.mkv"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="表示名"
            value={newFileDisplayName}
            onChange={(e) => setNewFileDisplayName(e.target.value)}
            className="w-32"
          />
          <Button size="sm" onClick={() => addFileMutation.mutate({ path: newFilePath, display_name: newFileDisplayName || undefined })} disabled={!newFilePath.trim()}><Plus size={14} /></Button>
        </div>
      </section>

      {/* Custom Fields */}
      {customFields.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">カスタム項目</h2>
          <div className="grid grid-cols-2 gap-3">
            {customFields.map((cf) => (
              <div key={cf.id}>
                <Label className="text-xs">{cf.name}</Label>
                {cf.field_type === "boolean" ? (
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
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Memo */}
      <section className="space-y-2">
        <h2 className="font-semibold">メモ</h2>
        <Textarea
          placeholder="メモを入力..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={handleMemoBlur}
          className="min-h-[120px]"
        />
      </section>
    </div>
  );
}
