import { useState } from "react";
import { Upload, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { api } from "@/api/client";
import type { ImportPreviewResponse, ImportResult, ExecuteRow } from "@/types";
import { Button } from "@/components/ui/button";

type RowState = {
  skipped: boolean;
  performerOverrides: Record<string, boolean>; // performer_name -> forceNew
};

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api.imports.preview(file);
      setPreview(data);

      const initialStates: Record<number, RowState> = {};
      data.rows.forEach((row) => {
        initialStates[row.row_number] = {
          skipped: row.is_duplicate_suspect,
          performerOverrides: {},
        };
      });
      setRowStates(initialStates);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowSkipped = (rowNumber: number) => {
    setRowStates((prev) => {
      const state = prev[rowNumber] || { skipped: false, performerOverrides: {} };
      return { ...prev, [rowNumber]: { ...state, skipped: !state.skipped } };
    });
  };

  const togglePerformerOverride = (rowNumber: number, performerName: string) => {
    setRowStates((prev) => {
      const state = prev[rowNumber] || { skipped: false, performerOverrides: {} };
      const overrides = { ...state.performerOverrides };
      overrides[performerName] = !overrides[performerName];
      return { ...prev, [rowNumber]: { ...state, performerOverrides: overrides } };
    });
  };

  const execute = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const executeRows: ExecuteRow[] = preview.rows
        .filter((row) => row.is_valid && !rowStates[row.row_number]?.skipped)
        .map((row) => {
          const state = rowStates[row.row_number];
          const performers = (row.performers || []).map((p) => {
            const forceNew = state?.performerOverrides?.[p.name] || false;
            return {
              name: p.name,
              furigana: p.furigana,
              performer_id: forceNew ? null : p.existing_id,
            };
          });
          return {
            row_number: row.row_number,
            title: row.title,
            performers,
            directory_path: row.directory_path,
          };
        });

      const res = await api.imports.execute(executeRows);
      setResult(res);
      setPreview(null);
      setRowStates({});
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setPreview(null); setRowStates({}); setResult(null); };

  const importCount = preview
    ? preview.rows.filter((row) => row.is_valid && !rowStates[row.row_number]?.skipped).length
    : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">CSVインポート</h1>
      <p className="text-sm text-muted-foreground">
        CSVファイルから作品を一括登録します。列: <code>title</code>, <code>performer_names</code>（カンマ区切り）, <code>performer_furiganas</code>（任意）, <code>directory_path</code>（任意）
      </p>

      {!preview && !result && (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <Upload size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">CSVファイルをドロップ、または</p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Button variant="outline" asChild>
              <span>ファイルを選択</span>
            </Button>
          </label>
        </div>
      )}

      {loading && <div className="text-center text-muted-foreground">読み込み中…</div>}

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm">
              全 {preview.rows.length} 行 / インポート対象 {importCount} 件 / エラー {preview.error_count} 件
            </span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={reset}>キャンセル</Button>
              <Button onClick={execute} disabled={importCount === 0 || loading}>
                {importCount}件をインポート
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-16 px-3 py-2 text-center">取り込む</th>
                  <th className="text-left px-3 py-2">作品名</th>
                  <th className="text-left px-3 py-2">出演者</th>
                  <th className="text-left px-3 py-2">パス</th>
                  <th className="text-left px-3 py-2">エラー</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => {
                  const isSkipped = rowStates[row.row_number]?.skipped;
                  const rowBg = !row.is_valid
                    ? "bg-destructive/5"
                    : isSkipped
                    ? "bg-muted/30 opacity-70"
                    : "";

                  return (
                    <tr key={row.row_number} className={`border-t transition-colors ${rowBg}`}>
                      <td className="px-3 py-2 text-center">
                        {row.is_valid ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer mx-auto block"
                            checked={!isSkipped}
                            onChange={() => toggleRowSkipped(row.row_number)}
                          />
                        ) : (
                          <XCircle size={16} className="text-destructive mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{row.title ?? <span className="text-muted-foreground">—</span>}</div>
                        {row.is_duplicate_suspect && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-0.5">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>{row.duplicate_hint}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                          {(row.performers || []).map((p, idx) => {
                            const state = rowStates[row.row_number];
                            const isOverride = state?.performerOverrides?.[p.name] || false;
                            const isMatched = p.existing_id !== null;

                            const displayText = p.existing_name
                              ? p.existing_aliases && p.existing_aliases.length > 0
                                ? `${p.existing_name} (${p.existing_aliases.join(", ")})`
                                : p.existing_name
                              : p.name;

                            return (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded text-xs border border-border"
                              >
                                {isMatched && !isOverride ? (
                                  <>
                                    <span className="text-green-700">{displayText}</span>
                                    <button
                                      type="button"
                                      className="text-[10px] text-muted-foreground underline hover:text-foreground border-l border-border pl-1.5"
                                      onClick={() => togglePerformerOverride(row.row_number, p.name)}
                                    >
                                      別人にする
                                    </button>
                                  </>
                                ) : isMatched && isOverride ? (
                                  <>
                                    <span className="text-amber-600">{p.name} <span className="font-medium">[新規]</span></span>
                                    <button
                                      type="button"
                                      className="text-[10px] text-muted-foreground underline hover:text-foreground border-l border-border pl-1.5"
                                      onClick={() => togglePerformerOverride(row.row_number, p.name)}
                                    >
                                      元に戻す
                                    </button>
                                  </>
                                ) : (
                                  <span>{p.name} <span className="text-muted-foreground">[新規]</span></span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.directory_path ?? "—"}</td>
                      <td className="px-3 py-2 text-destructive text-xs">{row.errors?.join(", ") ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border p-6 text-center space-y-2">
            <CheckCircle2 size={40} className="mx-auto text-green-500" />
            <p className="font-semibold text-lg">{result.created_count}件をインポートしました</p>
            {result.skipped_count > 0 && <p className="text-muted-foreground text-sm">{result.skipped_count}件をスキップ</p>}
            {result.errors.length > 0 && (
              <ul className="text-destructive text-sm text-left space-y-1 mt-2">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
          <Button onClick={reset} variant="outline" className="w-full">続けてインポートする</Button>
        </div>
      )}
    </div>
  );
}
