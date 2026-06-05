import { useState } from "react";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/api/client";
import type { ImportPreviewResponse, ImportRow, ImportResult } from "@/types";
import { Button } from "@/components/ui/button";

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api.imports.preview(file);
      setPreview(data);
    } finally {
      setLoading(false);
    }
  };

  const execute = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const validRows: ImportRow[] = preview.rows.filter((r) => r.is_valid);
      const res = await api.imports.execute(validRows);
      setResult(res);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setPreview(null); setResult(null); };

  return (
    <div className="space-y-6 max-w-3xl">
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
            <span className="text-sm">全 {preview.rows.length} 行 / 正常 {preview.valid_count} 件 / エラー {preview.error_count} 件</span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={reset}>キャンセル</Button>
              <Button onClick={execute} disabled={preview.valid_count === 0}>
                {preview.valid_count}件をインポート
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2">作品名</th>
                  <th className="text-left px-3 py-2">出演者</th>
                  <th className="text-left px-3 py-2">パス</th>
                  <th className="text-left px-3 py-2">エラー</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.row_number} className={`border-t ${!row.is_valid ? "bg-destructive/5" : ""}`}>
                    <td className="px-3 py-2 text-center">
                      {row.is_valid
                        ? <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                        : <XCircle size={16} className="text-destructive mx-auto" />}
                    </td>
                    <td className="px-3 py-2">{row.title ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.performer_names.map((n, i) => (
                        <span key={i}>{n}{row.performer_furiganas[i] ? ` (${row.performer_furiganas[i]})` : ""}</span>
                      )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, ", ", el], [] as React.ReactNode[])}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.directory_path ?? "—"}</td>
                    <td className="px-3 py-2 text-destructive text-xs">{row.errors.join(", ")}</td>
                  </tr>
                ))}
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
