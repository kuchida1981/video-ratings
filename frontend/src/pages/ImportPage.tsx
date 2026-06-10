import React, { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { api } from "@/api/client";
import type { ImportPreviewResponse, ImportRow, ImportResult } from "@/types";
import { Button } from "@/components/ui/button";

type Phase = "upload" | "preview" | "confirm" | "result";

export default function ImportPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api.imports.preview(file);
      setPreview(data);
      setSelectedRows(new Set(data.rows.filter((r) => r.is_valid).map((r) => r.row_number)));
      setPhase("preview");
    } finally {
      setLoading(false);
    }
  };

  const execute = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const rows = preview.rows.filter((r) => selectedRows.has(r.row_number));
      const res = await api.imports.execute(rows);
      setResult(res);
      setPhase("result");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setSelectedRows(new Set());
    setPhase("upload");
  };

  const toggleRow = (rowNumber: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const selectAll = () => {
    if (!preview) return;
    setSelectedRows(new Set(preview.rows.filter((r) => r.is_valid).map((r) => r.row_number)));
  };

  const deselectAll = () => setSelectedRows(new Set());

  const renderRows = (rows: ImportRow[], showErrors: boolean) =>
    rows.map((row) => (
      <React.Fragment key={row.row_number}>
        <tr className={!row.is_valid ? "bg-muted/30 text-muted-foreground" : ""}>
          <td className="px-3 pt-2">
            <input
              type="checkbox"
              checked={selectedRows.has(row.row_number)}
              disabled={!row.is_valid}
              onChange={() => toggleRow(row.row_number)}
              className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            />
          </td>
          <td className="px-3 pt-2">{row.title ?? <span className="text-muted-foreground">—</span>}</td>
          <td className="px-3 pt-2 text-muted-foreground">
            {row.performer_names
              .map((n, i) => (
                <span key={i}>
                  {n}
                  {row.performer_furiganas[i] ? ` (${row.performer_furiganas[i]})` : ""}
                </span>
              ))
              .reduce(
                (acc, el, i) => (i === 0 ? [el] : [...acc, ", ", el]),
                [] as React.ReactNode[]
              )}
          </td>
        </tr>
        {(row.directory_path || (showErrors && row.errors.length > 0)) && (
          <tr className={!row.is_valid ? "bg-muted/30" : ""}>
            <td className="px-3 pb-2" />
            <td colSpan={2} className="px-3 pb-2 space-y-0.5">
              {row.directory_path && (
                <div className="font-mono text-xs text-muted-foreground">{row.directory_path}</div>
              )}
              {showErrors && row.errors.length > 0 && (
                <div className="text-xs text-destructive">{row.errors.join(", ")}</div>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    ));

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">CSVインポート</h1>
      <p className="text-sm text-muted-foreground">
        CSVファイルから作品を一括登録します。列: <code>title</code>,{" "}
        <code>performer_names</code>（カンマ区切り）, <code>performer_furiganas</code>（任意）,{" "}
        <code>directory_path</code>（任意）
      </p>

      {phase === "upload" && (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
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
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <Button variant="outline" asChild>
              <span>ファイルを選択</span>
            </Button>
          </label>
        </div>
      )}

      {loading && <div className="text-center text-muted-foreground">読み込み中…</div>}

      {phase === "preview" && preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm">
              全 {preview.rows.length} 行 / 正常 {preview.valid_count} 件 / エラー{" "}
              {preview.error_count} 件
            </span>
            <div className="flex gap-2 ml-auto flex-wrap">
              <Button variant="outline" size="sm" onClick={selectAll}>
                全選択
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                全解除
              </Button>
              <Button variant="outline" onClick={reset}>
                キャンセル
              </Button>
              <Button onClick={() => setPhase("confirm")} disabled={selectedRows.size === 0}>
                確認へ →（{selectedRows.size}件）
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-3 py-2" />
                  <th className="text-left px-3 py-2">作品名</th>
                  <th className="text-left px-3 py-2">出演者</th>
                </tr>
              </thead>
              <tbody>{renderRows(preview.rows, true)}</tbody>
            </table>
          </div>
        </div>
      )}

      {phase === "confirm" && preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium">{selectedRows.size}件をインポートします</span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setPhase("preview")}>
                ← 戻る
              </Button>
              <Button onClick={execute} disabled={selectedRows.size === 0 || loading}>
                インポート実行
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-3 py-2" />
                  <th className="text-left px-3 py-2">作品名</th>
                  <th className="text-left px-3 py-2">出演者</th>
                </tr>
              </thead>
              <tbody>
                {renderRows(
                  preview.rows.filter((r) => selectedRows.has(r.row_number)),
                  false
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div className="space-y-4">
          <div className="rounded-lg border p-6 text-center space-y-2">
            <CheckCircle2 size={40} className="mx-auto text-green-500" />
            <p className="font-semibold text-lg">{result.created_count}件をインポートしました</p>
            {result.skipped_count > 0 && (
              <p className="text-muted-foreground text-sm">{result.skipped_count}件をスキップ</p>
            )}
            {result.errors.length > 0 && (
              <ul className="text-destructive text-sm text-left space-y-1 mt-2">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
          <Button onClick={reset} variant="outline" className="w-full">
            続けてインポートする
          </Button>
        </div>
      )}
    </div>
  );
}
