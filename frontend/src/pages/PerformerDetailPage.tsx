import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Search, X } from "lucide-react";
import { api } from "@/api/client";
import type { CustomFieldDefinition, Performer, WorkListItem, TagCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WorkTile } from "@/components/WorkTile";
import { StringArrayInput } from "@/components/StringArrayInput";
import { CoverUploadZone } from "@/components/CoverUploadZone";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";

export default function PerformerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const performerId = Number(id);

  const [performer, setPerformer] = useState<Performer | null>(null);
  const [works, setWorks] = useState<WorkListItem[]>([]);
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean | string[]>>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", furigana: "" });
  const { maxCols } = useTileMaxColumns();
  const gridStyle = useTileGridStyle(maxCols);

  const reload = () => {
    api.performers.get(performerId).then(setPerformer);
    api.performers.works(performerId).then(setWorks);
  };

  useEffect(() => {
    reload();
    api.tagCategories.list("performer").then(setCategories);
    api.customFields.list("performer").then(setCustomFieldDefs);
  }, [performerId]);

  useEffect(() => {
    if (performer && editing) setForm({ name: performer.name, furigana: performer.furigana ?? "" });
  }, [editing, performer]);

  useEffect(() => {
    if (performer && customFieldDefs.length > 0) {
      const values: Record<string, string | boolean | string[]> = {};
      customFieldDefs.forEach((cf) => {
        const raw = performer.custom_fields?.[cf.name];
        if (cf.field_type === "boolean") values[cf.name] = Boolean(raw);
        else if (cf.field_type === "string_array") values[cf.name] = Array.isArray(raw) ? (raw as string[]) : [];
        else values[cf.name] = String(raw ?? "");
      });
      setCustomFieldValues(values);
    }
  }, [performer, customFieldDefs]);

  if (!performer) return <div className="text-muted-foreground">読み込み中…</div>;

  const save = async () => {
    await api.performers.update(performerId, { name: form.name, furigana: form.furigana || undefined });
    setEditing(false);
    reload();
  };

  const deletePerformer = async () => {
    if (!confirm("この出演者を削除しますか？")) return;
    await api.performers.delete(performerId);
    navigate("/performers");
  };

  const toggleTag = async (tagId: number) => {
    const has = performer.tags.some((t) => t.id === tagId);
    if (has) await api.performers.removeTag(performerId, tagId);
    else await api.performers.addTag(performerId, tagId);
    reload();
  };

  const updateCustomField = async (name: string, value: string | boolean | string[]) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
    const apiValue = Array.isArray(value) ? (value.length === 0 ? null : value) : (value === "" ? null : value);
    await api.performers.updateCustomFields(performerId, { [name]: apiValue });
    reload();
  };

  const uploadCover = async (file: File) => {
    await api.performers.uploadCover(performerId, file);
    reload();
  };

  const deleteCover = async () => {
    await api.performers.deleteCover(performerId);
    reload();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* カバー画像 */}
      <section className="space-y-2">
        {performer.cover_image_url ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <img src={performer.cover_image_url} alt={performer.name} className="w-full h-full object-cover" />
            <button
              onClick={deleteCover}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <CoverUploadZone onUpload={uploadCover} />
        )}
      </section>

      <div className="flex items-start justify-between">
        <div>
          {editing ? (
            <div className="space-y-2">
              <div><Label>名前</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>ふりがな</Label><Input value={form.furigana} onChange={(e) => setForm({ ...form, furigana: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button onClick={save}>保存</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>キャンセル</Button>
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
            </>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-2xl font-bold text-primary">{performer.total_score}点</div>
          {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>編集</Button>}
          <Button variant="destructive" size="sm" onClick={deletePerformer}><Trash2 size={14} /></Button>
        </div>
      </div>

      {/* Tags */}
      <section className="space-y-2">
        <h2 className="font-semibold">評価タグ</h2>
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
                    variant={performer.tags.some((t) => t.id === tag.id) ? "default" : "outline"}
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

      {/* Custom Fields */}
      {customFieldDefs.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">カスタム項目</h2>
          <div className="grid grid-cols-2 gap-3">
            {customFieldDefs.map((cf) => (
              <div key={cf.id} className={cf.field_type === "string_array" ? "col-span-2" : ""}>
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
                ) : cf.field_type === "string_array" ? (
                  <StringArrayInput
                    value={(customFieldValues[cf.name] as string[]) ?? []}
                    onChange={(v) => updateCustomField(cf.name, v)}
                  />
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

      {/* Works */}
      <section className="space-y-2">
        <h2 className="font-semibold">出演作品 ({works.length})</h2>
        {works.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">出演作品なし</p>
        ) : (
          <div className="grid gap-3" style={gridStyle}>
            {works.map((w) => (
              <WorkTile key={w.id} work={w} onClick={() => navigate(`/works/${w.id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
