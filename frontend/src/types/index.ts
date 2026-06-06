import type { ReactNode } from "react";

export interface WorkFile {
  id: number;
  work_id: number;
  path: string;
  display_name: string | null;
  order: number;
}

export interface PerformerInWork {
  id: number;
  name: string;
  furigana: string | null;
  is_main: boolean;
  tags: TagInWork[];
  total_score: number;
  custom_fields: Record<string, unknown> | null;
}

export interface TagInWork {
  id: number;
  name: string;
  score: number | null;
  category_id: number;
}

export interface Work {
  id: number;
  title: string;
  maker: string | null;
  series: string | null;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  files: WorkFile[];
  performers: PerformerInWork[];
  tags: TagInWork[];
  total_score: number;
}

export interface WorkListItem {
  id: number;
  title: string;
  maker: string | null;
  series: string | null;
  created_at: string;
  total_score: number;
  performers: { id: number; name: string }[];
  custom_fields: Record<string, unknown> | null;
  tags: { id: number; name: string; category_id: number }[];
}

export interface TagSummary {
  id: number;
  name: string;
  score: number | null;
}

export interface Performer {
  id: number;
  name: string;
  furigana: string | null;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  tags: TagSummary[];
  total_score: number;
  work_count: number;
}

export interface Tag {
  id: number;
  category_id: number;
  name: string;
  score: number | null;
  description: string | null;
  sort_order: number;
}

export interface TagCategory {
  id: number;
  name: string;
  entity_type: "work" | "performer";
  is_multi_select: boolean;
  description: string | null;
  sort_order: number;
  tags: Tag[];
}

export interface CustomFieldDefinition {
  id: number;
  name: string;
  field_type: "text" | "number" | "date" | "boolean";
  entity_type: "work" | "performer";
  created_at: string;
}

export interface ImportRow {
  row_number: number;
  title: string | null;
  performer_names: string[];
  performer_furiganas: string[];
  directory_path: string | null;
  errors: string[];
  is_valid: boolean;
}

export interface ImportPreviewResponse {
  rows: ImportRow[];
  valid_count: number;
  error_count: number;
}

export interface ImportResult {
  created_count: number;
  skipped_count: number;
  errors: string[];
}

export interface ColumnDef<T> {
  id: string;
  label: string;
  required: boolean;
  defaultVisible: boolean;
  width: string;
  align?: "left" | "right";
  render: (item: T) => ReactNode;
}
