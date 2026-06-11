import { useState } from "react";
import { api } from "@/api/client";
import type { ImportPreviewResponse, ImportResult, ExecuteRow } from "@/types";

type RowState = {
  skipped: boolean;
  performerOverrides: Record<string, boolean>;
};

export type ImportPhase = "upload" | "preview" | "confirm" | "result";

export function useImportFlow(onImportComplete?: () => void) {
  const [importPhase, setImportPhase] = useState<ImportPhase>("upload");
  const [confirmRowNumbers, setConfirmRowNumbers] = useState<Set<number>>(new Set());
  const [importPreview, setImportPreview] = useState<ImportPreviewResponse | null>(null);
  const [importRowStates, setImportRowStates] = useState<Record<number, RowState>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importDragOver, setImportDragOver] = useState(false);

  const handleImportFile = async (file: File) => {
    setImportLoading(true);
    setImportResult(null);
    try {
      const data = await api.imports.preview(file);
      setImportPreview(data);
      const initialStates: Record<number, RowState> = {};
      data.rows.forEach((row) => {
        initialStates[row.row_number] = { skipped: row.is_duplicate_suspect, performerOverrides: {} };
      });
      setImportRowStates(initialStates);
      setImportPhase("preview");
    } catch (e) {
      alert(e instanceof Error ? e.message : "インポートプレビューの取得に失敗しました");
    } finally {
      setImportLoading(false);
    }
  };

  const toggleImportRowSkipped = (rowNumber: number) => {
    setImportRowStates((prev) => {
      const state = prev[rowNumber] || { skipped: false, performerOverrides: {} };
      return { ...prev, [rowNumber]: { ...state, skipped: !state.skipped } };
    });
  };

  const toggleImportPerformerOverride = (rowNumber: number, name: string) => {
    setImportRowStates((prev) => {
      const state = prev[rowNumber] || { skipped: false, performerOverrides: {} };
      const overrides = { ...state.performerOverrides, [name]: !state.performerOverrides[name] };
      return { ...prev, [rowNumber]: { ...state, performerOverrides: overrides } };
    });
  };

  const executeImport = async () => {
    if (!importPreview) return;
    setImportLoading(true);
    try {
      const executeRows: ExecuteRow[] = importPreview.rows
        .filter((r) => r.is_valid && !importRowStates[r.row_number]?.skipped)
        .map((r) => ({
          row_number: r.row_number,
          title: r.title,
          performers: r.performers.map((p) => ({
            name: p.name,
            furigana: p.furigana,
            performer_id: importRowStates[r.row_number]?.performerOverrides?.[p.name] ? null : p.existing_id,
          })),
          directory_path: r.directory_path,
        }));
      const res = await api.imports.execute(executeRows);
      setImportResult(res);
      setImportPhase("result");
      setImportPreview(null);
      setImportRowStates({});
      onImportComplete?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "インポートの実行に失敗しました");
    } finally {
      setImportLoading(false);
    }
  };

  const resetImport = () => {
    setImportPreview(null);
    setImportRowStates({});
    setImportResult(null);
    setImportPhase("upload");
    setConfirmRowNumbers(new Set());
  };

  const selectAllImport = () => {
    if (!importPreview) return;
    setImportRowStates((prev) => {
      const next = { ...prev };
      importPreview.rows.forEach((row) => {
        if (row.is_valid)
          next[row.row_number] = { ...(next[row.row_number] || { performerOverrides: {} }), skipped: false };
      });
      return next;
    });
  };

  const deselectAllImport = () => {
    if (!importPreview) return;
    setImportRowStates((prev) => {
      const next = { ...prev };
      importPreview.rows.forEach((row) => {
        if (row.is_valid)
          next[row.row_number] = { ...(next[row.row_number] || { performerOverrides: {} }), skipped: true };
      });
      return next;
    });
  };

  const importCount = importPreview
    ? importPreview.rows.filter((r) => r.is_valid && !importRowStates[r.row_number]?.skipped).length
    : 0;

  return {
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
  };
}
