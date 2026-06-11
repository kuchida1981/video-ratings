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
  memo: string | null;
  created_at: string;
  updated_at: string;
  files: WorkFile[];
  performers: PerformerInWork[];
  tags: TagInWork[];
  total_score: number;
  cover_image_url: string | null;
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
  tags: { id: number; name: string; score: number | null; category_id: number }[];
  cover_image_url: string | null;
  file_count: number;
}

export interface TagSummary {
  id: number;
  name: string;
  score: number | null;
}

export interface PerformerAlias {
  id: number;
  name: string;
  furigana: string | null;
}

export interface Performer {
  id: number;
  name: string;
  furigana: string | null;
  aliases: PerformerAlias[];
  custom_fields: Record<string, unknown> | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
  tags: TagSummary[];
  total_score: number;
  work_count: number;
  avg_work_score: number;
  cover_image_url: string | null;
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
  sort_order: number;
  is_sortable: boolean;
  created_at: string;
}

export interface PerformerMatch {
  name: string;
  furigana: string | null;
  existing_id: number | null;
  existing_name: string | null;
  existing_aliases: string[];
}

export interface ImportRow {
  row_number: number;
  title: string | null;
  performers: PerformerMatch[];
  directory_path: string | null;
  errors: string[];
  is_valid: boolean;
  is_duplicate_suspect: boolean;
  duplicate_hint: string | null;
}

export interface ImportPreviewResponse {
  rows: ImportRow[];
  valid_count: number;
  error_count: number;
}

export interface PerformerExecuteInfo {
  name: string;
  furigana: string | null;
  performer_id: number | null;
}

export interface ExecuteRow {
  row_number: number;
  title: string | null;
  performers: PerformerExecuteInfo[];
  directory_path: string | null;
}

export interface ImportResult {
  created_count: number;
  skipped_count: number;
  errors: string[];
}

