"use client";
// Sinclaire Storion — Story Brain (AD-style filmmaking insights)
import { Brain, ChevronRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useStudio } from "@/lib/studio/store";
import { analyzeProject } from "@/lib/studio/story-brain";
import type { StoryBrainInsight } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

const SEV_STYLE: Record<StoryBrainInsight["severity"], { dot: string; label: string }> = {
  warning: { dot: "bg-amber-400", label: "Watch" },
  suggestion: { dot: "bg-sky-400", label: "Suggestion" },
  info: { dot: "bg-muted-foreground/60", label: "Note" },
};

const CATEGORY_LABEL: Record<StoryBrainInsight["category"], string> = {
  coverage: "Coverage",
  pacing: "Pacing",
  "screen-direction": "Screen Direction",
  emphasis: "Emphasis",
  composition: "Composition",
  rhythm: "Rhythm",
  continuity: "Continuity",
};

export function StoryBrainView() {
  const project = useStudio((s) => s.project);
  const setView = useStudio((s) => s.setView);
  const setHighlight = useStudio((s) => s.setHighlight);
  const selectScene = useStudio((s) => s.selectScene);
  const selectPanel = useStudio((s) => s.selectPanel);

  const insights = useMemo(() => analyzeProject(project), [project]);

  const reveal = (insight: StoryBrainInsight) => {
    setHighlight(insight.panelIds);
    if (insight.panelIds[0]) selectPanel(insight.panelIds[0]);
    selectScene(insight.sceneId);
    setView("board");
  };

  const counts = insights.reduce(
    (acc, i) => {
      acc[i.severity] += 1;
      return acc;
    },
    { warning: 0, suggestion: 0, info: 0 } as Record<StoryBrainInsight["severity"], number>
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-gradient-to-br from-sky-500/10 to-transparent p-4">
        <div className="rounded-lg bg-sky-500/15 p-2 text-sky-400">
          <Brain className="size-6" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">Story Brain</h2>
          <p className="text-muted-foreground text-sm">
            Like an experienced assistant director reading your board — it notices technical and
            storytelling opportunities. It never rewrites your vision.
          </p>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400" /> {counts.warning} to watch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-400" /> {counts.suggestion} suggestions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/60" /> {counts.info} notes
            </span>
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border border-dashed p-10 text-center">
          <Sparkles className="size-8 text-emerald-400" />
          <p className="font-medium text-sm">Nothing flagged.</p>
          <p className="text-muted-foreground text-xs">
            Your coverage, screen direction, and pacing look clean. Keep building.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {insights.map((insight) => {
            const sev = SEV_STYLE[insight.severity];
            return (
              <li key={insight.id}>
                <button
                  className="group flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-ring/60"
                  onClick={() => reveal(insight)}
                  type="button"
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", sev.dot)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{insight.title}</span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-secondary-foreground uppercase tracking-wide">
                        {CATEGORY_LABEL[insight.category]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">{insight.detail}</p>
                  </div>
                  {insight.panelIds.length > 0 && (
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
