import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Plus, Star, UserCheck, Search, Play, X } from "lucide-react";
import { CoverUploadZone } from "@/components/CoverUploadZone";
import { api } from "@/api/client";
import type { Work, TagCategory, Performer, CustomFieldDefinition, WorkFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workId = Number(id);

  const [work, setWork] = useState<Work | null>(null);
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [performerCategories, setPerformerCategories] = useState<TagCategory[]>([]);
  const [allPerformers, setAllPerformers] = useState<Performer[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [performerCFDefs, setPerformerCFDefs] = useState<CustomFieldDefinition[]>([]);
  const [performerCFValues, setPerformerCFValues] = useState<Record<number, Record<string, string | boolean>>>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", maker: "", series: "" });
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileDisplayName, setNewFileDisplayName] = useState("");
  const [addPerformerId, setAddPerformerId] = useState("");
  const [playingFileId, setPlayingFileId] = useState<number | null>(null);
  const [playingFile, setPlayingFile] = useState<WorkFile | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isSmbUrl = (path: string) => path.startsWith("smb://");

  const reload = () => api.works.get(workId).then(setWork);

  useEffect(() => {
    reload();
    api.tagCategories.list("work").then(setCategories);
    api.tagCategories.list("performer").then(setPerformerCategories);
    api.performers.list().then(setAllPerformers);
    api.customFields.list("work").then(setCustomFields);
    api.customFields.list("performer").then(setPerformerCFDefs);
  }, [workId]);

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
    const video = videoRef.current;
    if (!video || !playingFile) return;
    video.load();
    video.play().then(() => {
      const v = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
      if (v.webkitEnterFullscreen) {
        v.webkitEnterFullscreen();
      } else {
        video.requestFullscreen?.();
      }
    }).catch(() => {});
  }, [playingFile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => setPlayingFile(null);
    const onDocChange = () => { if (!document.fullscreenElement) setPlayingFile(null); };
    video.addEventListener("webkitendfullscreen", onEnd);
    document.addEventListener("fullscreenchange", onDocChange);
    return () => {
      video.removeEventListener("webkitendfullscreen", onEnd);
      document.removeEventListener("fullscreenchange", onDocChange);
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

  if (!work) return <div className="text-muted-foreground">読み込み中…</div>;

  const smbFiles = work.files.filter((f) => isSmbUrl(f.path));

  const saveEdit = async () => {
    await api.works.update(workId, { title: form.title, maker: form.maker || undefined, series: form.series || undefined });
    setEditing(false);
    reload();
  };

  const deleteWork = async () => {
    if (!confirm("この作品を削除しますか？")) return;
    await api.works.delete(workId);
    navigate("/works");
  };

  const addFile = async () => {
    if (!newFilePath.trim()) return;
    await api.works.addFile(workId, { path: newFilePath, display_name: newFileDisplayName || undefined });
    setNewFilePath("");
    setNewFileDisplayName("");
    reload();
  };

  const addPerformer = async () => {
    if (!addPerformerId) return;
    await api.works.addPerformer(workId, { performer_id: Number(addPerformerId) });
    setAddPerformerId("");
    reload();
  };

  const toggleTag = async (tagId: number) => {
    const has = work.tags.some((t) => t.id === tagId);
    if (has) await api.works.removeTag(workId, tagId);
    else await api.works.addTag(workId, tagId);
    reload();
  };

  const togglePerformerTag = async (performer: Work["performers"][number], tagId: number, cat: TagCategory) => {
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
    reload();
  };

  const updatePerformerCustomField = async (performerId: number, name: string, value: string | boolean) => {
    setPerformerCFValues((prev) => ({
      ...prev,
      [performerId]: { ...prev[performerId], [name]: value },
    }));
    await api.performers.updateCustomFields(performerId, { [name]: value === "" ? null : value });
    reload();
  };

  const updateCustomField = async (name: string, value: string | boolean) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
    await api.works.updateCustomFields(workId, { [name]: value === "" ? null : value });
    reload();
  };

  const uploadCover = async (file: File) => {
    await api.works.uploadCover(workId, file);
    reload();
  };

  const deleteCover = async () => {
    await api.works.deleteCover(workId);
    reload();
  };

  const availablePerformers = allPerformers.filter(
    (p) => !work.performers.some((wp) => wp.id === p.id)
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* カバー画像 */}
      <section className="space-y-2">
        {(work.cover_image_url || smbFiles.length > 0) ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
            {work.cover_image_url && (
              <img src={work.cover_image_url} alt={work.title} className="w-full h-full object-cover" />
            )}
            {work.cover_image_url && (
              <button
                onClick={deleteCover}
                className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            )}
            {smbFiles.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
                {smbFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPlayingFile(f)}
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
        ) : (
          <CoverUploadZone onUpload={uploadCover} />
        )}
        <video
          ref={videoRef}
          className="sr-only"
          src={playingFile ? `/api/works/${workId}/files/${playingFile.id}/stream` : undefined}
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
                <Button onClick={saveEdit}>保存</Button>
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
          <Button variant="destructive" size="sm" onClick={deleteWork}><Trash2 size={14} /></Button>
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
                    onClick={() => api.works.setMainPerformer(workId, p.id, true).then(reload)}
                    title="主演に設定"
                  >
                    <UserCheck size={14} />
                  </button>
                )}
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => api.works.removePerformer(workId, p.id).then(reload)}
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
                        onClick={() => togglePerformerTag(p, tag.id, cat)}
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
                          onChange={(e) => updatePerformerCustomField(p.id, cf.name, e.target.checked)}
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
                        onBlur={(e) => updatePerformerCustomField(p.id, cf.name, e.target.value)}
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
            <Button size="sm" onClick={addPerformer} disabled={!addPerformerId}>追加</Button>
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
                    onClick={() => toggleTag(tag.id)}
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
            <div className="flex items-center gap-2 text-sm">
              <code className="flex-1 bg-muted px-2 py-1 rounded text-xs">{f.path}</code>
              {f.display_name && <span className="text-muted-foreground">{f.display_name}</span>}
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
                  api.works.removeFile(workId, f.id).then(reload);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {playingFileId === f.id && (
              <video
                key={f.id}
                controls
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
          <Button size="sm" onClick={addFile} disabled={!newFilePath.trim()}><Plus size={14} /></Button>
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
                      onChange={(e) => updateCustomField(cf.name, e.target.checked)}
                    />
                  </div>
                ) : (
                  <Input
                    type={cf.field_type === "number" ? "number" : cf.field_type === "date" ? "date" : "text"}
                    value={String(customFieldValues[cf.name] ?? "")}
                    onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [cf.name]: e.target.value }))}
                    onBlur={(e) => updateCustomField(cf.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
