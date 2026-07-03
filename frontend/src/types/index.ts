export type DataRow = Record<string, string | number>;

export type CsvHealth = {
  score: number;
  status: string;
  missing_cells: number;
  missing_ratio: number;
  duplicate_rows: number;
  duplicate_ratio: number;
  empty_columns: number;
  numeric_columns: number;
  text_columns: number;
  recommendations: string[];
};

export type Workspace = {
  id: string;
  name: string;
  files: UploadedFile[];
};

export type UploadedFile = {
  filename: string;
  path?: string;
  columns: string[];
  row_count: number;
  health?: CsvHealth;
};

export type UploadedDataset = {
  filename: string;
  columns: string[];
  row_count: number;
  preview: DataRow[];
  health?: CsvHealth;
};

export type UploadCsvResponse = {
  message: string;
  workspace_id: string;
  filename: string;
  columns: string[];
  row_count: number;
  preview: DataRow[];
  health?: CsvHealth;
};

export type ChatTableRow = Record<string, string | number>;

export type ChartConfig = {
  type: "bar" | "line" | "table";
  x: string;
  y: string;
  title: string;
};

export type ChatResponse = {
  type: string;
  answer: string;
  table?: ChatTableRow[];
  chart?: ChartConfig;
  columns?: string[];
  row_count?: number;
  summary?: Record<string, unknown>;
  insights?: string[];
  follow_ups?: string[];
};
