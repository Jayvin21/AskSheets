"use client";

import { ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChartIcon, SheetIcon, TrashIcon, UploadIcon } from "@/components/ui/Icons";
import type { CsvHealth, UploadedDataset, Workspace } from "@/types";

type UploadPreviewPageProps = {
  activeWorkspace: Workspace | null;
  datasets: UploadedDataset[];
  activeDataset: UploadedDataset | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onSelectDataset: (filename: string) => void;
  onRemoveCsv: (filename: string) => void;
};

export function UploadPreviewPage({
  activeWorkspace,
  datasets,
  activeDataset,
  isUploading,
  onUpload,
  onSelectDataset,
  onRemoveCsv,
}: UploadPreviewPageProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    onUpload(file);
    event.target.value = "";
  }

  const visibleColumns = activeDataset?.columns ?? [];
  const previewRows = activeDataset?.preview ?? [];

  return (
    <section className="mx-auto w-full max-w-[1360px] px-10 py-10">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="animate-fade-up mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Upload & Preview
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {activeWorkspace
            ? `Workspace: ${activeWorkspace.name}. Upload multiple CSVs, inspect quality, and switch between files.`
            : "Create a workspace first, then upload CSV files."}
        </p>
      </div>

      {!activeWorkspace ? (
        <Card className="animate-soft-pop grid min-h-[420px] place-items-center px-6 py-12 text-center">
          <div>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-violet-50 text-violet-600">
              <SheetIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              No workspace selected
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create a workspace from the sidebar to start analyzing CSV files.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="animate-fade-up group relative mb-5 grid min-h-40 w-full place-items-center overflow-hidden rounded-[30px] border border-dashed border-violet-300/80 bg-white/50 px-8 py-8 text-center shadow-[0_20px_70px_rgba(124,58,237,0.05)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50/40 hover:shadow-[0_24px_80px_rgba(124,58,237,0.10)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading && (
              <div className="animate-shimmer absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-violet-100 to-transparent" />
            )}

            <div className="relative">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl border border-violet-100 bg-white/80 text-violet-600 shadow-sm transition group-hover:scale-105">
                <UploadIcon className="h-6 w-6" />
              </div>
              <p className="font-medium text-slate-700">
                {isUploading ? "Uploading CSV..." : "Upload another CSV"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Each file gets a preview, column list, and health score.
              </p>
            </div>
          </button>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">CSV files</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a file to preview its columns, rows, and health.
                  </p>
                </div>
                <span className="rounded-2xl bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                  {datasets.length} uploaded
                </span>
              </div>

              {datasets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 px-5 py-8 text-center text-sm text-slate-500">
                  No CSV uploaded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {datasets.map((dataset) => {
                    const active = dataset.filename === activeDataset?.filename;

                    return (
                      <div
                        key={dataset.filename}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                          active
                            ? "border-violet-300 bg-violet-50 text-violet-800"
                            : "border-violet-100 bg-white/60 text-slate-700"
                        }`}
                      >
                        <button
                          onClick={() => onSelectDataset(dataset.filename)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <SheetIcon className="h-5 w-5 shrink-0 text-violet-600" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {dataset.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                              {dataset.row_count} rows • {dataset.columns.length} columns
                              {dataset.health ? ` • ${dataset.health.score}/100 health` : ""}
                            </p>
                          </div>
                        </button>

                        <Button
                          variant="ghost"
                          className="h-11 w-11 rounded-2xl px-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => onRemoveCsv(dataset.filename)}
                          title="Remove CSV"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <div className="grid gap-5">
              <CsvHealthCard health={activeDataset?.health} />

              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">Columns</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeDataset
                        ? `Columns from ${activeDataset.filename}`
                        : "Select or upload a CSV to see columns."}
                    </p>
                  </div>
                </div>

                {visibleColumns.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 px-5 py-8 text-center text-sm text-slate-500">
                    No columns available.
                  </div>
                ) : (
                  <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                    {visibleColumns.map((column) => (
                      <span
                        key={column}
                        className="rounded-2xl border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                      >
                        {column}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Card className="animate-soft-pop overflow-hidden">
            {previewRows.length === 0 ? (
              <div className="grid min-h-[360px] place-items-center px-6 py-12 text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-800">No preview yet</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Upload a CSV to inspect the first rows.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {activeDataset?.filename}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Showing preview rows for selected CSV.
                    </p>
                  </div>
                  <span className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                    Ready
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead>
                      <tr className="bg-violet-50/70 text-left text-xs text-slate-600">
                        {visibleColumns.map((column) => (
                          <th
                            key={column}
                            className="border-b border-r border-violet-100 px-5 py-4 font-semibold"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {previewRows.slice(0, 10).map((row, index) => (
                        <tr key={index} className="hover:bg-violet-50/40">
                          {visibleColumns.map((column) => (
                            <td
                              key={column}
                              className="whitespace-nowrap border-b border-r border-violet-100/70 px-5 py-3 text-xs text-slate-700"
                            >
                              {row[column]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-5 py-4 text-sm text-slate-500">
                  <p>
                    Showing 1 to {Math.min(10, previewRows.length)} of{" "}
                    {activeDataset?.row_count ?? previewRows.length} rows
                  </p>
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </section>
  );
}

function CsvHealthCard({ health }: { health?: CsvHealth }) {
  if (!health) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600">
            <ChartIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">CSV Health</h2>
            <p className="mt-1 text-xs text-slate-500">
              Upload a CSV to calculate its quality score.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const ringStyle = {
    background: `conic-gradient(#7c3aed ${health.score * 3.6}deg, #ede9fe 0deg)`,
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-semibold text-slate-900">CSV Health</h2>
          <p className="mt-1 text-xs text-slate-500">
            Quality scan based on missing values, duplicates, empty columns, and data types.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <HealthMetric label="Missing" value={`${health.missing_ratio}%`} />
            <HealthMetric label="Duplicates" value={`${health.duplicate_rows}`} />
            <HealthMetric label="Numeric" value={`${health.numeric_columns}`} />
            <HealthMetric label="Text" value={`${health.text_columns}`} />
          </div>
        </div>

        <div className="shrink-0 text-center">
          <div
            className="grid h-24 w-24 place-items-center rounded-full p-2"
            style={ringStyle}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-white">
              <div>
                <p className="text-2xl font-bold text-violet-700">{health.score}</p>
                <p className="text-[11px] font-medium text-slate-400">/100</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold text-violet-700">
            {health.status}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-violet-100 bg-violet-50/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
          Recommendations
        </p>
        <ul className="space-y-1.5 text-sm text-slate-700">
          {health.recommendations.map((recommendation) => (
            <li key={recommendation} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function HealthMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-violet-50/70 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}
