import type {
  Work,
  WorkListItem,
  WorkFile,
  Performer,
  TagCategory,
  Tag,
  CustomFieldDefinition,
  ImportPreviewResponse,
  ImportRow,
  ImportResult,
} from "@/types";

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function upload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? res.statusText);
  }
  return res.json();
}

// Works
export const api = {
  works: {
    list: () => req<WorkListItem[]>("/works"),
    get: (id: number) => req<Work>(`/works/${id}`),
    create: (data: Partial<Work>) => req<Work>("/works", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Work>) => req<Work>(`/works/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/works/${id}`, { method: "DELETE" }),
    addFile: (id: number, data: { path: string; display_name?: string; order?: number }) =>
      req<WorkFile>(`/works/${id}/files`, { method: "POST", body: JSON.stringify(data) }),
    removeFile: (id: number, fileId: number) => req<void>(`/works/${id}/files/${fileId}`, { method: "DELETE" }),
    addPerformer: (id: number, data: { performer_id: number; is_main?: boolean }) =>
      req<Work>(`/works/${id}/performers`, { method: "POST", body: JSON.stringify(data) }),
    removePerformer: (id: number, performerId: number) =>
      req<Work>(`/works/${id}/performers/${performerId}`, { method: "DELETE" }),
    setMainPerformer: (id: number, performerId: number, is_main: boolean) =>
      req<Work>(`/works/${id}/performers/${performerId}`, { method: "PATCH", body: JSON.stringify({ is_main }) }),
    addTag: (id: number, tagId: number) => req<Work>(`/works/${id}/tags/${tagId}`, { method: "POST" }),
    removeTag: (id: number, tagId: number) => req<Work>(`/works/${id}/tags/${tagId}`, { method: "DELETE" }),
    updateCustomFields: (id: number, fields: Record<string, unknown>) =>
      req<Work>(`/works/${id}/custom-fields`, { method: "PATCH", body: JSON.stringify(fields) }),
    uploadCover: (id: number, file: File) => upload<Work>(`/works/${id}/cover`, file),
    deleteCover: (id: number) => req<Work>(`/works/${id}/cover`, { method: "DELETE" }),
    search: (params: Record<string, string | number | boolean | string[]>) => {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) v.forEach((val) => qs.append(k, String(val)));
        else if (v !== undefined && v !== "") qs.append(k, String(v));
      }
      return req<WorkListItem[]>(`/works/search?${qs}`);
    },
  },

  performers: {
    list: () => req<Performer[]>("/performers"),
    get: (id: number) => req<Performer>(`/performers/${id}`),
    create: (data: { name: string; furigana?: string }) =>
      req<Performer>("/performers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; furigana?: string }) =>
      req<Performer>(`/performers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/performers/${id}`, { method: "DELETE" }),
    works: (id: number) => req<WorkListItem[]>(`/performers/${id}/works`),
    addTag: (id: number, tagId: number) => req<Performer>(`/performers/${id}/tags/${tagId}`, { method: "POST" }),
    removeTag: (id: number, tagId: number) => req<Performer>(`/performers/${id}/tags/${tagId}`, { method: "DELETE" }),
    updateCustomFields: (id: number, fields: Record<string, unknown>) =>
      req<Performer>(`/performers/${id}/custom-fields`, { method: "PATCH", body: JSON.stringify(fields) }),
    uploadCover: (id: number, file: File) => upload<Performer>(`/performers/${id}/cover`, file),
    deleteCover: (id: number) => req<Performer>(`/performers/${id}/cover`, { method: "DELETE" }),
  },

  tagCategories: {
    list: (entityType?: string) =>
      req<TagCategory[]>(`/tag-categories${entityType ? `?entity_type=${entityType}` : ""}`),
    create: (data: { name: string; entity_type: string; is_multi_select: boolean }) =>
      req<TagCategory>("/tag-categories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; is_multi_select?: boolean }) =>
      req<TagCategory>(`/tag-categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/tag-categories/${id}`, { method: "DELETE" }),
    reorder: (ids: number[]) =>
      req<void>("/tag-categories/reorder", { method: "PUT", body: JSON.stringify({ ids }) }),
  },

  tags: {
    list: (categoryId?: number) =>
      req<Tag[]>(`/tags${categoryId ? `?category_id=${categoryId}` : ""}`),
    create: (data: { name: string; category_id: number; score?: number | null }) =>
      req<Tag>("/tags", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; score?: number | null }) =>
      req<Tag>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/tags/${id}`, { method: "DELETE" }),
    reorder: (ids: number[]) =>
      req<void>("/tags/reorder", { method: "PUT", body: JSON.stringify({ ids }) }),
  },

  customFields: {
    list: (entityType?: string) =>
      req<CustomFieldDefinition[]>(`/custom-field-definitions${entityType ? `?entity_type=${entityType}` : ""}`),
    create: (data: { name: string; field_type: string; entity_type?: string }) =>
      req<CustomFieldDefinition>("/custom-field-definitions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string }) =>
      req<CustomFieldDefinition>(`/custom-field-definitions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/custom-field-definitions/${id}`, { method: "DELETE" }),
    reorder: (ids: number[]) =>
      req<void>("/custom-field-definitions/reorder", { method: "PUT", body: JSON.stringify({ ids }) }),
  },

  imports: {
    preview: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return fetch(`${BASE}/import/preview`, { method: "POST", body: form })
        .then((r) => r.json() as Promise<ImportPreviewResponse>);
    },
    execute: (rows: ImportRow[]) =>
      req<ImportResult>("/import/execute", { method: "POST", body: JSON.stringify({ rows }) }),
  },

  data: {
    exportAndDownload: async () => {
      const res = await fetch(`${BASE}/export`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? res.statusText);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `video-ratings-export-${now}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    },
    import: (file: File) => upload<{ message: string }>("/import", file),
  },
};
