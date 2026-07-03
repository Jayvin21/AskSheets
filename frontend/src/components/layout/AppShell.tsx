"use client";

import { useState } from "react";
import { AnalystPage } from "@/components/analyst/AnalystPage";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { UploadPreviewPage } from "@/components/upload/UploadPreviewPage";
import { askQuestion, createWorkspace, deleteCsv, uploadCsv } from "@/lib/api";
import type {
  ChatResponse,
  UploadedDataset,
  Workspace,
} from "@/types";

type ChatEntry = {
  id: string;
  question: string;
  response: ChatResponse;
  filename: string;
};

type WorkspaceState = {
  datasets: UploadedDataset[];
  activeFilename: string | null;
  chatEntries: ChatEntry[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "analyst">("upload");

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaceStates, setWorkspaceStates] = useState<Record<string, WorkspaceState>>({});

  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;

  const activeState =
    activeWorkspaceId && workspaceStates[activeWorkspaceId]
      ? workspaceStates[activeWorkspaceId]
      : {
          datasets: [],
          activeFilename: null,
          chatEntries: [],
        };

  const activeDataset =
    activeState.datasets.find(
      (dataset) => dataset.filename === activeState.activeFilename
    ) ?? activeState.datasets[0] ?? null;

  async function handleCreateWorkspace(name: string) {
    try {
      setError(null);
      setIsCreatingWorkspace(true);

      const workspace = await createWorkspace(name);

      setWorkspaces((current) => [...current, workspace]);
      setActiveWorkspaceId(workspace.id);
      setWorkspaceStates((current) => ({
        ...current,
        [workspace.id]: {
          datasets: [],
          activeFilename: null,
          chatEntries: [],
        },
      }));
      setActiveTab("upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Workspace creation failed");
    } finally {
      setIsCreatingWorkspace(false);
    }
  }

  function handleSelectWorkspace(workspaceId: string) {
    setActiveWorkspaceId(workspaceId);
    setError(null);
  }

  function handleSelectDataset(filename: string) {
    if (!activeWorkspaceId) return;

    setWorkspaceStates((current) => ({
      ...current,
      [activeWorkspaceId]: {
        ...current[activeWorkspaceId],
        activeFilename: filename,
      },
    }));
  }

  async function handleUpload(file: File) {
    try {
      setError(null);

      if (!activeWorkspaceId) {
        throw new Error("Create or select a workspace first.");
      }

      setIsUploading(true);

      const result = await uploadCsv(activeWorkspaceId, file);

      const uploadedDataset: UploadedDataset = {
        filename: result.filename,
        columns: result.columns,
        row_count: result.row_count,
        preview: result.preview,
        health: result.health,
      };

      setWorkspaceStates((current) => {
        const previous = current[activeWorkspaceId] ?? {
          datasets: [],
          activeFilename: null,
          chatEntries: [],
        };

        const datasets = [
          ...previous.datasets.filter(
            (dataset) => dataset.filename !== uploadedDataset.filename
          ),
          uploadedDataset,
        ];

        return {
          ...current,
          [activeWorkspaceId]: {
            ...previous,
            datasets,
            activeFilename: uploadedDataset.filename,
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveCsv(filename: string) {
    try {
      setError(null);

      if (!activeWorkspaceId) return;

      await deleteCsv(activeWorkspaceId, filename);

      setWorkspaceStates((current) => {
        const previous = current[activeWorkspaceId];

        if (!previous) return current;

        const datasets = previous.datasets.filter(
          (dataset) => dataset.filename !== filename
        );

        const nextActiveFilename =
          previous.activeFilename === filename
            ? datasets[0]?.filename ?? null
            : previous.activeFilename;

        return {
          ...current,
          [activeWorkspaceId]: {
            datasets,
            activeFilename: nextActiveFilename,
            chatEntries: previous.chatEntries.filter(
              (entry) => entry.filename !== filename
            ),
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove CSV failed");
    }
  }

  function handleClearChat() {
    if (!activeWorkspaceId) return;

    setWorkspaceStates((current) => ({
      ...current,
      [activeWorkspaceId]: {
        ...current[activeWorkspaceId],
        chatEntries: [],
      },
    }));
  }

  async function handleAsk(question: string) {
    try {
      setError(null);

      if (!activeWorkspaceId) {
        throw new Error("Create or select a workspace first.");
      }

      if (!activeDataset) {
        throw new Error("Upload a CSV first before asking questions.");
      }

      setIsAsking(true);

      const [response] = await Promise.all([
        askQuestion(activeWorkspaceId, question, activeDataset.filename),
        delay(1200),
      ]);

      const chatEntry: ChatEntry = {
        id: `${Date.now()}-${Math.random()}`,
        question,
        response,
        filename: activeDataset.filename,
      };

      setWorkspaceStates((current) => ({
        ...current,
        [activeWorkspaceId]: {
          ...current[activeWorkspaceId],
          chatEntries: [...(current[activeWorkspaceId]?.chatEntries ?? []), chatEntry],
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Question failed");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f5f0ff_0%,#fbfbff_38%,#ffffff_100%)] text-slate-950">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          isCreatingWorkspace={isCreatingWorkspace}
          onToggle={() => setSidebarCollapsed((current) => !current)}
          onCreateWorkspace={handleCreateWorkspace}
          onSelectWorkspace={handleSelectWorkspace}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />

          {error && (
            <div className="animate-fade-up mx-10 mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {activeTab === "upload" ? (
              <UploadPreviewPage
                activeWorkspace={activeWorkspace}
                datasets={activeState.datasets}
                activeDataset={activeDataset}
                isUploading={isUploading}
                onUpload={handleUpload}
                onSelectDataset={handleSelectDataset}
                onRemoveCsv={handleRemoveCsv}
              />
            ) : (
              <AnalystPage
                activeWorkspace={activeWorkspace}
                activeDataset={activeDataset}
                chatEntries={activeState.chatEntries}
                isAsking={isAsking}
                onAsk={handleAsk}
                onClearChat={handleClearChat}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

