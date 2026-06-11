import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./client";

function mockFetch(status: number, body?: unknown) {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? "Not Found" : status === 204 ? "No Content" : "OK",
    json: vi.fn().mockResolvedValue(body ?? {}),
    blob: vi.fn().mockResolvedValue(new Blob()),
  };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  return { fetchMock: vi.mocked(fetch), response };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("api.works", () => {
  it("list returns parsed JSON on 200", async () => {
    const data = [{ id: 1, title: "Test Work" }];
    mockFetch(200, data);
    expect(await api.works.list()).toEqual(data);
  });

  it("get throws Error on 404", async () => {
    const { response } = mockFetch(404, { detail: "Not Found" });
    response.ok = false;
    await expect(api.works.get(999)).rejects.toThrow("Not Found");
  });

  it("delete returns undefined on 204", async () => {
    mockFetch(204);
    expect(await api.works.delete(1)).toBeUndefined();
  });

  it("search builds array query params correctly", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.works.search({ title: "test", tag_ids: ["1", "2"] });
    const url = (fetchMock.mock.calls[0] as [string])[0];
    expect(url).toContain("title=test");
    expect(url).toContain("tag_ids=1");
    expect(url).toContain("tag_ids=2");
  });

  it("search skips empty string values", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.works.search({ title: "", maker: "ACME" });
    const url = (fetchMock.mock.calls[0] as [string])[0];
    expect(url).not.toContain("title=");
    expect(url).toContain("maker=ACME");
  });

  it("create sends POST", async () => {
    const { fetchMock } = mockFetch(200, { id: 1 });
    await api.works.create({ title: "New" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/works"), expect.objectContaining({ method: "POST" }));
  });

  it("update sends PUT", async () => {
    const { fetchMock } = mockFetch(200, { id: 1 });
    await api.works.update(1, { title: "Updated" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/works/1"), expect.objectContaining({ method: "PUT" }));
  });

  it("addFile sends POST to files endpoint", async () => {
    const { fetchMock } = mockFetch(200, { id: 1 });
    await api.works.addFile(1, { path: "/some/path" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/works/1/files"), expect.objectContaining({ method: "POST" }));
  });

  it("removeFile sends DELETE to files endpoint", async () => {
    mockFetch(204);
    await api.works.removeFile(1, 2);
  });

  it("addPerformer sends POST", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.works.addPerformer(1, { performer_id: 2 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/performers"), expect.objectContaining({ method: "POST" }));
  });

  it("removePerformer sends DELETE", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.works.removePerformer(1, 2);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/performers/2"), expect.objectContaining({ method: "DELETE" }));
  });

  it("setMainPerformer sends PATCH", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.works.setMainPerformer(1, 2, true);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/performers/2"), expect.objectContaining({ method: "PATCH" }));
  });

  it("addTag sends POST to tags endpoint", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.works.addTag(1, 3);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tags/3"), expect.objectContaining({ method: "POST" }));
  });

  it("removeTag sends DELETE to tags endpoint", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.works.removeTag(1, 3);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tags/3"), expect.objectContaining({ method: "DELETE" }));
  });

  it("updateCustomFields sends PATCH", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.works.updateCustomFields(1, { year: 2024 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/custom-fields"), expect.objectContaining({ method: "PATCH" }));
  });
});

describe("api.performers", () => {
  it("list fetches performers", async () => {
    mockFetch(200, []);
    expect(await api.performers.list()).toEqual([]);
  });

  it("get fetches single performer", async () => {
    mockFetch(200, { id: 1 });
    expect(await api.performers.get(1)).toEqual({ id: 1 });
  });

  it("create sends POST", async () => {
    const { fetchMock } = mockFetch(200, { id: 1 });
    await api.performers.create({ name: "Alice" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/performers"), expect.objectContaining({ method: "POST" }));
  });

  it("update sends PUT", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.performers.update(1, { name: "Bob" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/performers/1"), expect.objectContaining({ method: "PUT" }));
  });

  it("delete sends DELETE", async () => {
    mockFetch(204);
    await api.performers.delete(1);
  });


  it("addTag sends POST", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.performers.addTag(1, 2);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tags/2"), expect.objectContaining({ method: "POST" }));
  });

  it("removeTag sends DELETE", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.performers.removeTag(1, 2);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tags/2"), expect.objectContaining({ method: "DELETE" }));
  });

  it("updateCustomFields sends PATCH", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.performers.updateCustomFields(1, { notes: "test" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/custom-fields"), expect.objectContaining({ method: "PATCH" }));
  });
});

describe("api.tagCategories", () => {
  it("list without entity_type", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.tagCategories.list();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tag-categories"), expect.anything());
  });

  it("list with entity_type appends query param", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.tagCategories.list("work");
    const url = (fetchMock.mock.calls[0] as [string])[0];
    expect(url).toContain("entity_type=work");
  });

  it("create sends POST", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.tagCategories.create({ name: "Genre", entity_type: "work", is_multi_select: true });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tag-categories"), expect.objectContaining({ method: "POST" }));
  });

  it("update sends PUT", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.tagCategories.update(1, { name: "Updated" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tag-categories/1"), expect.objectContaining({ method: "PUT" }));
  });

  it("delete sends DELETE", async () => {
    mockFetch(204);
    await api.tagCategories.delete(1);
  });

  it("reorder sends PUT", async () => {
    const { fetchMock } = mockFetch(204);
    await api.tagCategories.reorder([3, 1, 2]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/reorder"), expect.objectContaining({ method: "PUT" }));
  });
});

describe("api.tags", () => {
  it("list without categoryId", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.tags.list();
    expect((fetchMock.mock.calls[0] as [string])[0]).not.toContain("category_id");
  });

  it("list with categoryId appends query param", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.tags.list(5);
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("category_id=5");
  });

  it("create sends POST", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.tags.create({ name: "Action", category_id: 1, score: 10 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tags"), expect.objectContaining({ method: "POST" }));
  });

  it("update sends PUT", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.tags.update(1, { score: 20 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tags/1"), expect.objectContaining({ method: "PUT" }));
  });

  it("delete sends DELETE", async () => {
    mockFetch(204);
    await api.tags.delete(1);
  });

  it("reorder sends PUT", async () => {
    mockFetch(204);
    await api.tags.reorder([2, 1]);
  });
});

describe("api.customFields", () => {
  it("list without entity_type", async () => {
    mockFetch(200, []);
    expect(await api.customFields.list()).toEqual([]);
  });

  it("list with entity_type appends query param", async () => {
    const { fetchMock } = mockFetch(200, []);
    await api.customFields.list("performer");
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("entity_type=performer");
  });

  it("create sends POST", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.customFields.create({ name: "Year", field_type: "number" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/custom-field-definitions"), expect.objectContaining({ method: "POST" }));
  });

  it("update sends PUT", async () => {
    const { fetchMock } = mockFetch(200, {});
    await api.customFields.update(1, { name: "Release Year" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/custom-field-definitions/1"), expect.objectContaining({ method: "PUT" }));
  });

  it("delete sends DELETE", async () => {
    mockFetch(204);
    await api.customFields.delete(1);
  });

  it("reorder sends PUT", async () => {
    mockFetch(204);
    await api.customFields.reorder([2, 1]);
  });
});

describe("api.imports", () => {
  it("execute sends POST with rows", async () => {
    const { fetchMock } = mockFetch(200, { created_count: 1, skipped_count: 0, errors: [] });
    await api.imports.execute([]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/import/execute"), expect.objectContaining({ method: "POST" }));
  });
});

describe("api.data", () => {
  it("import sends POST", async () => {
    const { fetchMock } = mockFetch(200, { message: "ok" });
    await api.data.import(new File([], "backup.zip", { type: "application/zip" }));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/import"), expect.objectContaining({ method: "POST" }));
  });
});
