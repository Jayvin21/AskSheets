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
};

export type DataRow = Record<string, string | number>;

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
};