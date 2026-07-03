"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FolderIcon, PlusIcon, SheetIcon } from "@/components/ui/Icons";
import type { Workspace } from "@/types";

type SidebarProps = {
  collapsed: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isCreatingWorkspace: boolean;
  onToggle: () => void;
  onCreateWorkspace: (name: string) => void;
  onSelectWorkspace: (workspaceId: string) => void;
};

export function Sidebar({
  collapsed,
  workspaces,
  activeWorkspaceId,
  isCreatingWorkspace,
  onToggle,
  onCreateWorkspace,
  onSelectWorkspace,
}: SidebarProps) {
  const [workspaceName, setWorkspaceName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = workspaceName.trim();
    if (!name || isCreatingWorkspace) return;

    onCreateWorkspace(name);
    setWorkspaceName("");
  }

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r border-violet-100/70 bg-white/70 px-4 py-6 backdrop-blur-2xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className={`mb-8 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <SheetIcon className="h-5 w-5" />
        </div>

        {!collapsed && (
          <div className="text-xl font-semibold tracking-tight text-violet-700">
            AskSheets AI
          </div>
        )}
      </div>

      {collapsed ? (
        <Button
          className="mb-8 h-12 px-0"
          onClick={() => onToggle()}
          title="Expand sidebar to create workspace"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-[24px] border border-violet-100 bg-white/70 p-2 shadow-sm backdrop-blur-xl">
            <input
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="New workspace name..."
              className="mb-2 w-full rounded-2xl bg-violet-50/60 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            />

            <Button
              type="submit"
              disabled={!workspaceName.trim() || isCreatingWorkspace}
              className="h-11 w-full"
            >
              <PlusIcon className="h-4 w-4" />
              {isCreatingWorkspace ? "Creating..." : "New Workspace"}
            </Button>
          </div>
        </form>
      )}

      {!collapsed && (
        <p className="mb-3 px-1 text-sm font-medium text-slate-500">
          Workspaces
        </p>
      )}

      <div className="space-y-2">
        {workspaces.length === 0 && !collapsed && (
          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-5 text-sm text-slate-500">
            Create a workspace to start.
          </div>
        )}

        {workspaces.map((workspace) => {
          const active = workspace.id === activeWorkspaceId;

          return (
            <button
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                active
                  ? "border border-violet-200 bg-violet-50/80 text-violet-700"
                  : "text-slate-600 hover:bg-violet-50"
              } ${collapsed ? "justify-center" : ""}`}
              title={workspace.name}
            >
              <FolderIcon
                className={`h-5 w-5 ${active ? "text-violet-600" : "text-slate-400"}`}
              />
              {!collapsed && <span className="truncate">{workspace.name}</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={onToggle}
        className="mt-auto grid h-11 w-11 place-items-center self-center rounded-2xl border border-violet-100 bg-white/70 text-violet-600 shadow-sm transition hover:bg-violet-50"
      >
        {collapsed ? "»" : "«"}
      </button>
    </aside>
  );
}
