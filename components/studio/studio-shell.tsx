"use client";
// Sinclaire Storion — application shell
import {
  Clapperboard,
  Download,
  FileText,
  Film,
  Grid3x3,
  LayoutList,
  Library,
  ListChecks,
  Brain,
  NotebookPen,
  RotateCcw,
  Upload,
  Video,
  Workflow,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStudio } from "@/lib/studio/store";
import type { Project, StudioView } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { BoardView } from "./board-view";
import { Inspector } from "./inspector";
import { LibraryView } from "./library-view";
import { NotebookView } from "./notebook-view";
import { ProductionView } from "./production-view";
import { ScriptImportView } from "./script-import-view";
import { ShotDesigner } from "./shot-designer";
import { StoryBrainView } from "./story-brain-view";
import { StoryFlowView } from "./story-flow-view";
import { TimelineView } from "./timeline-view";

const NAV: { view: StudioView; label: string; icon: typeof Grid3x3 }[] = [
  { view: "board", label: "Board", icon: Grid3x3 },
  { view: "designer", label: "Shot Designer", icon: Video },
  { view: "timeline", label: "Timeline", icon: LayoutList },
  { view: "flow", label: "Story Flow", icon: Workflow },
  { view: "brain", label: "Story Brain", icon: Brain },
  { view: "library", label: "Library", icon: Library },
  { view: "notebook", label: "Notebook", icon: NotebookPen },
  { view: "production", label: "Production", icon: ListChecks },
  { view: "import", label: "Script Import", icon: FileText },
];

const INSPECTOR_VIEWS: StudioView[] = ["board", "designer", "timeline"];

function ViewSwitch({ view }: { view: StudioView }) {
  switch (view) {
    case "board":
      return <BoardView />;
    case "designer":
      return <ShotDesigner />;
    case "timeline":
      return <TimelineView />;
    case "flow":
      return <StoryFlowView />;
    case "brain":
      return <StoryBrainView />;
    case "library":
      return <LibraryView />;
    case "notebook":
      return <NotebookView />;
    case "production":
      return <ProductionView />;
    case "import":
      return <ScriptImportView />;
    default:
      return null;
  }
}

export function StudioShell() {
  const view = useStudio((s) => s.view);
  const setView = useStudio((s) => s.setView);
  const project = useStudio((s) => s.project);
  const scenes = project.scenes;
  const selectedSceneId = useStudio((s) => s.selectedSceneId);
  const selectScene = useStudio((s) => s.selectScene);
  const updateMeta = useStudio((s) => s.updateProjectMeta);
  const resetSample = useStudio((s) => s.resetToSample);
  const importProject = useStudio((s) => s.importProject);
  const fileRef = useRef<HTMLInputElement>(null);

  const showInspector = INSPECTOR_VIEWS.includes(view);

  // Storion is a dark-by-default workspace regardless of the OS theme.
  useEffect(() => {
    const root = document.documentElement;
    const hadLight = root.classList.contains("light");
    root.classList.add("dark");
    root.classList.remove("light");
    return () => {
      root.classList.remove("dark");
      if (hadLight) root.classList.add("light");
    };
  }, []);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}.storion.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project exported.");
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Project;
        if (!parsed.scenes || !parsed.panels) throw new Error("bad file");
        importProject(parsed);
        toast.success(`Loaded "${parsed.title}".`);
      } catch {
        toast.error("Not a valid Storion project file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const totalRuntime = project.panels.reduce((a, p) => a + p.duration, 0);

  return (
    <div className="dark flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-border border-b bg-card/60 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
            <Film className="size-4.5" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight">Sinclaire Storion</span>
              <span className="rounded bg-secondary px-1 py-0.5 text-[9px] text-muted-foreground uppercase tracking-wide">
                Beta
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">Sinclaire Sebastian Studios</span>
          </div>
        </div>

        <div className="mx-2 h-8 w-px bg-border" />

        <div className="flex min-w-0 flex-1 flex-col">
          <input
            className="w-full max-w-md truncate bg-transparent font-semibold text-sm outline-none placeholder:text-muted-foreground"
            onChange={(e) => updateMeta({ title: e.target.value })}
            placeholder="Untitled Project"
            value={project.title}
          />
          <input
            className="w-full max-w-lg truncate bg-transparent text-muted-foreground text-xs outline-none placeholder:text-muted-foreground/50"
            onChange={(e) => updateMeta({ logline: e.target.value })}
            placeholder="Add a logline…"
            value={project.logline}
          />
        </div>

        <div className="hidden items-center gap-3 text-muted-foreground text-xs sm:flex">
          <span>{project.scenes.length} scenes</span>
          <span>{project.panels.length} shots</span>
          <span className="font-mono">
            {Math.floor(totalRuntime / 60)}:{String(Math.round(totalRuntime % 60)).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn label="Import project" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" />
          </IconBtn>
          <IconBtn label="Export project (JSON)" onClick={exportJson}>
            <Download className="size-4" />
          </IconBtn>
          <IconBtn
            label="Reset to sample"
            onClick={() => {
              if (confirm("Reset to the sample project? Your current work will be replaced.")) resetSample();
            }}
          >
            <RotateCcw className="size-4" />
          </IconBtn>
          <input accept=".json" className="hidden" onChange={onImportFile} ref={fileRef} type="file" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-border border-r bg-card/40 p-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  view === item.view
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                key={item.view}
                onClick={() => setView(item.view)}
                type="button"
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}

          <div className="mt-3 mb-1 px-2.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
            Scenes
          </div>
          <div className="flex flex-col gap-0.5 overflow-y-auto">
            <button
              className={cn(
                "rounded px-2.5 py-1.5 text-left text-xs transition-colors",
                !selectedSceneId ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:bg-secondary/40"
              )}
              onClick={() => selectScene(null)}
              type="button"
            >
              All scenes
            </button>
            {scenes.map((sc) => (
              <button
                className={cn(
                  "truncate rounded px-2.5 py-1.5 text-left text-xs transition-colors",
                  selectedSceneId === sc.id ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:bg-secondary/40"
                )}
                key={sc.id}
                onClick={() => {
                  selectScene(sc.id);
                  if (view === "flow" || view === "import") setView("board");
                }}
                type="button"
              >
                <span className="font-mono">{sc.number}.</span> {sc.location}
              </button>
            ))}
          </div>
        </nav>

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-auto bg-background">
          <ViewSwitch view={view} />
        </main>

        {/* Inspector */}
        {showInspector && (
          <aside className="hidden w-80 shrink-0 border-border border-l bg-card/40 lg:block">
            <Inspector />
          </aside>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
