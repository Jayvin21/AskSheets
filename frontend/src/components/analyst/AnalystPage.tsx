"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ChartIcon,
  ListIcon,
  SendIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "@/components/ui/Icons";
import type { ChatResponse, ChatTableRow, UploadedDataset, Workspace } from "@/types";

type ChatEntry = {
  id: string;
  question: string;
  response: ChatResponse;
  filename: string;
};

type AnalystPageProps = {
  activeWorkspace: Workspace | null;
  activeDataset: UploadedDataset | null;
  chatEntries: ChatEntry[];
  isAsking: boolean;
  onAsk: (question: string) => void;
  onClearChat: () => void;
};

const suggestions = [
  {
    label: "Total sales by region",
    icon: ChartIcon,
    question: "What is total sales by region?",
  },
  {
    label: "Show summary",
    icon: ListIcon,
    question: "Give me a summary",
  },
  {
    label: "Top products",
    icon: StarIcon,
    question: "What is total sales by product?",
  },
  {
    label: "Sales by category",
    icon: TagIcon,
    question: "What is total sales by product category?",
  },
];

export function AnalystPage({
  activeWorkspace,
  activeDataset,
  chatEntries,
  isAsking,
  onAsk,
  onClearChat,
}: AnalystPageProps) {
  const [question, setQuestion] = useState("");

  const canAsk = Boolean(activeWorkspace && activeDataset);

  function submitQuestion(value: string) {
    const trimmed = value.trim();

    if (!trimmed || !canAsk || isAsking) return;

    onAsk(trimmed);
    setQuestion("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  return (
    <section className="mx-auto flex min-h-full w-full max-w-[1360px] flex-col px-10 py-8">
      <div className="animate-fade-up flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            AI Analyst
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {activeWorkspace
              ? `Ask questions about ${activeWorkspace.name}.`
              : "Create a workspace and upload a CSV before asking questions."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeDataset && (
            <div className="rounded-2xl border border-violet-100 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur-xl">
              Using{" "}
              <span className="font-medium text-violet-700">
                {activeDataset.filename}
              </span>
              <span className="mx-2 text-slate-300">•</span>
              {activeDataset.row_count} rows
              <span className="mx-2 text-slate-300">•</span>
              {activeDataset.columns.length} columns
            </div>
          )}

          {chatEntries.length > 0 && (
            <Button variant="secondary" onClick={onClearChat}>
              <TrashIcon className="h-4 w-4" />
              Clear chat
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;

          return (
            <button
              key={suggestion.label}
              onClick={() => submitQuestion(suggestion.question)}
              disabled={!canAsk || isAsking}
              className="animate-fade-up flex min-w-0 items-center gap-3 rounded-2xl border border-violet-100 bg-white/65 px-5 py-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Icon className="h-5 w-5 shrink-0 text-violet-600" />
              <span className="truncate">{suggestion.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 min-h-0 flex-1 space-y-6 pb-6">
        {!activeWorkspace && (
          <EmptyAnalystState
            title="No workspace selected"
            description="Create a workspace from the sidebar first."
          />
        )}

        {activeWorkspace && !activeDataset && (
          <EmptyAnalystState
            title="Upload a CSV first"
            description="The analyst needs a selected CSV file before it can answer questions."
          />
        )}

        {activeWorkspace && activeDataset && chatEntries.length === 0 && (
          <EmptyAnalystState
            title="Ready to analyze"
            description="Ask a question below or use one of the suggestion chips."
          />
        )}

        {chatEntries.map((entry) => (
          <ChatTurn
            key={entry.id}
            entry={entry}
            onFollowUp={submitQuestion}
            isAsking={isAsking}
          />
        ))}

        {isAsking && <ThinkingTurn />}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-4">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 rounded-[26px] border border-violet-300 bg-white/80 p-2 shadow-[0_20px_60px_rgba(124,58,237,0.08)] backdrop-blur-xl transition focus-within:border-violet-500 focus-within:shadow-[0_24px_70px_rgba(124,58,237,0.15)]">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={!canAsk || isAsking}
            placeholder={
              canAsk
                ? "Ask a question about your selected CSV..."
                : "Create workspace and upload CSV first..."
            }
            className="min-w-0 flex-1 bg-transparent px-5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <Button
            type="submit"
            disabled={!canAsk || isAsking || question.trim().length === 0}
            className="h-12 w-14 shrink-0 rounded-2xl px-0"
            title="Send"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          AI Analyst can make mistakes. Please verify important information.
        </p>
      </form>
    </section>
  );
}

function xmlEscape(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function downloadText(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function rowsToCsv(rows: ChatTableRow[]) {
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);

  const escapeValue = (value: string | number) => {
    const stringValue = String(value ?? "");
    const escaped = stringValue.replaceAll('"', '""');
    return `"${escaped}"`;
  };

  return [
    columns.map(escapeValue).join(","),
    ...rows.map((row) => columns.map((column) => escapeValue(row[column])).join(",")),
  ].join("\n");
}

function formatShort(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function chartToSvg(
  rows: ChatTableRow[],
  xKey: string,
  yKey: string,
  title: string
) {
  const width = 1100;
  const height = 620;
  const paddingLeft = 95;
  const paddingRight = 55;
  const paddingTop = 90;
  const paddingBottom = 145;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(1, ...rows.map((row) => Number(row[yKey])));

  const slotWidth = chartWidth / rows.length;
  const barWidth = Math.min(86, Math.max(42, slotWidth * 0.52));

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const y = paddingTop + chartHeight - chartHeight * ratio;
      const value = maxValue * ratio;

      return `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#ede9fe" stroke-width="1"/>
        <text x="${paddingLeft - 12}" y="${y + 5}" text-anchor="end" font-size="13" fill="#64748b">${xmlEscape(formatShort(value))}</text>
      `;
    })
    .join("");

  const bars = rows
    .map((row, index) => {
      const value = Number(row[yKey]);
      const barHeight = (value / maxValue) * chartHeight;
      const x = paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2;
      const y = paddingTop + chartHeight - barHeight;
      const label = String(row[xKey]);

      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="14" fill="url(#barGradient)" />
        <text x="${x + barWidth / 2}" y="${y - 12}" text-anchor="middle" font-size="14" font-weight="600" fill="#334155">${xmlEscape(formatShort(value))}</text>
        <text x="${x + barWidth / 2}" y="${height - paddingBottom + 38}" text-anchor="middle" font-size="13" fill="#475569" transform="rotate(-22 ${x + barWidth / 2} ${height - paddingBottom + 38})">${xmlEscape(label)}</text>
      `;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#6d28d9"/>
          <stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="24" fill="#ffffff"/>
      <text x="${paddingLeft}" y="45" font-size="26" font-weight="700" fill="#0f172a">${xmlEscape(title)}</text>
      <text x="${paddingLeft}" y="70" font-size="14" fill="#64748b">Generated from AskSheets AI chat response</text>
      ${gridLines}
      <line x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${width - paddingRight}" y2="${paddingTop + chartHeight}" stroke="#c4b5fd" stroke-width="2"/>
      <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${paddingTop + chartHeight}" stroke="#c4b5fd" stroke-width="2"/>
      ${bars}
    </svg>
  `.trim();
}

function BotAvatar() {
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
      <StarIcon className="h-6 w-6" />
    </div>
  );
}

function ThinkingTurn() {
  return (
    <div className="animate-fade-up flex gap-4">
      <BotAvatar />

      <Card className="overflow-hidden px-6 py-5">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>Analyzing selected CSV</span>
          <span className="flex items-center gap-1">
            <span className="thinking-dot h-2 w-2 rounded-full bg-violet-500" />
            <span className="thinking-dot h-2 w-2 rounded-full bg-violet-500" />
            <span className="thinking-dot h-2 w-2 rounded-full bg-violet-500" />
          </span>
        </div>

        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-violet-50">
          <div className="animate-shimmer absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
        </div>
      </Card>
    </div>
  );
}

function EmptyAnalystState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="animate-soft-pop grid min-h-[320px] place-items-center px-6 py-12 text-center">
      <div>
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <StarIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

function ChatTurn({
  entry,
  onFollowUp,
  isAsking,
}: {
  entry: ChatEntry;
  onFollowUp: (question: string) => void;
  isAsking: boolean;
}) {
  const { question, response, filename } = entry;

  const tableRows = response.table ?? [];
  const tableColumns = tableRows[0] ? Object.keys(tableRows[0]) : [];

  const xKey = response.chart?.x ?? tableColumns[0];
  const yKey = response.chart?.y ?? tableColumns[1];
  const chartTitle = response.chart?.title ?? "Chart";

  const chartRows = tableRows.filter((row) => {
    const value = Number(row[yKey]);
    return !Number.isNaN(value);
  });

  const maxValue = Math.max(1, ...chartRows.map((row) => Number(row[yKey])));
  const baseName = safeFilename(chartTitle || response.type || "asksheets");

  return (
    <div className="animate-fade-up space-y-4 overflow-hidden">
      <div className="flex justify-end gap-4">
        <div className="max-w-[70%] rounded-[26px] rounded-tr-md border border-violet-100 bg-violet-50/80 px-5 py-4 text-sm text-slate-800 shadow-sm">
          <p>{question}</p>
          <p className="mt-2 text-right text-xs text-slate-400">{filename}</p>
        </div>
      </div>

      <div className="flex min-w-0 gap-4">
        <BotAvatar />

        <Card className="min-w-0 flex-1 overflow-hidden p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <p className="text-base text-slate-800">{response.answer}</p>

            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {tableRows.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    downloadText(
                      `${baseName}-table.csv`,
                      rowsToCsv(tableRows),
                      "text/csv"
                    )
                  }
                >
                  Download table
                </Button>
              )}

              {chartRows.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    downloadText(
                      `${baseName}-chart.svg`,
                      chartToSvg(chartRows, xKey, yKey, chartTitle),
                      "image/svg+xml"
                    )
                  }
                >
                  Download chart
                </Button>
              )}

              {response.summary && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    downloadText(
                      `${safeFilename(filename)}-summary.json`,
                      JSON.stringify(response.summary, null, 2),
                      "application/json"
                    )
                  }
                >
                  Download summary
                </Button>
              )}
            </div>
          </div>

          {response.insights && response.insights.length > 0 && (
            <div className="mb-5 rounded-3xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="mb-3 text-sm font-semibold text-violet-700">
                Key insights
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                {response.insights.map((insight) => (
                  <li key={insight} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {response.columns && (
            <div className="mb-5 flex flex-wrap gap-2">
              {response.columns.map((column) => (
                <span
                  key={column}
                  className="rounded-2xl border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                >
                  {column}
                </span>
              ))}
            </div>
          )}

          {response.summary ? (
            <SummaryCards summary={response.summary} />
          ) : tableRows.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,0.8fr)_minmax(360px,1.2fr)]">
              <div className="min-w-0 overflow-hidden rounded-3xl border border-violet-100 bg-white/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-violet-50/80 text-left text-slate-700">
                      <tr>
                        {tableColumns.map((column) => (
                          <th
                            key={column}
                            className="border-b border-r border-violet-100 px-5 py-4 font-semibold last:text-right"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {tableRows.map((row: ChatTableRow, rowIndex: number) => (
                        <tr key={rowIndex}>
                          {tableColumns.map((column, columnIndex) => (
                            <td
                              key={column}
                              className={`border-b border-r border-violet-100/70 px-5 py-4 text-slate-700 ${
                                columnIndex === tableColumns.length - 1
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              {typeof row[column] === "number"
                                ? Number(row[column]).toLocaleString("en-US", {
                                    maximumFractionDigits: 2,
                                  })
                                : row[column]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {chartRows.length > 0 && (
                <div className="min-w-0 overflow-hidden rounded-3xl border border-violet-100 bg-white/60 p-5">
                  <h3 className="mb-5 font-semibold text-slate-900">
                    {chartTitle}
                  </h3>

                  <div className="flex h-64 min-w-0 items-end gap-4 border-l border-b border-violet-100 px-5 pb-7 sm:gap-6">
                    {chartRows.map((row, index) => {
                      const value = Number(row[yKey]);
                      const height = `${(value / maxValue) * 175}px`;

                      return (
                        <div
                          key={`${String(row[xKey])}-${index}`}
                          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                        >
                          <span className="max-w-full truncate text-xs font-medium text-slate-700">
                            {value.toLocaleString("en-US", {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                          <div
                            className="w-full max-w-[72px] rounded-t-2xl bg-gradient-to-t from-violet-700 to-violet-400 shadow-lg shadow-violet-100 transition-all duration-500"
                            style={{ height }}
                          />
                          <span className="max-w-full truncate text-xs text-slate-600">
                            {String(row[xKey])}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {response.follow_ups && response.follow_ups.length > 0 && (
            <div className="mt-5 border-t border-violet-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-600">
                Follow-up questions
              </p>
              <div className="flex flex-wrap gap-2">
                {response.follow_ups.map((followUp) => (
                  <button
                    key={followUp}
                    disabled={isAsking}
                    onClick={() => onFollowUp(followUp)}
                    className="rounded-2xl border border-violet-100 bg-white/80 px-3 py-2 text-xs font-medium text-violet-700 transition hover:bg-violet-50 disabled:opacity-50"
                  >
                    {followUp}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryCards({ summary }: { summary: Record<string, unknown> }) {
  const entries = Object.entries(summary);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(([column, rawValue]) => {
        const stats = rawValue as Record<string, number | string>;

        return (
          <div
            key={column}
            className="rounded-3xl border border-violet-100 bg-white/70 p-5 shadow-sm"
          >
            <p className="mb-4 text-sm font-semibold text-violet-700">
              {column}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Count" value={stats.count} />
              <Metric label="Mean" value={stats.mean} />
              <Metric label="Min" value={stats.min} />
              <Metric label="Max" value={stats.max} />
              <Metric label="Median" value={stats["50%"]} />
              <Metric label="Std" value={stats.std} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string | undefined;
}) {
  const formatted =
    typeof value === "number"
      ? value.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : value ?? "-";

  return (
    <div className="rounded-2xl bg-violet-50/70 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{formatted}</p>
    </div>
  );
}
