"use client";
// Sinclaire Storion — storyboard panel card
import { MessageSquare, Move } from "lucide-react";
import { angleLabel, movementLabel } from "@/lib/studio/constants";
import { useStudio } from "@/lib/studio/store";
import type { Panel } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { ShotFrame } from "./shot-frame";
import { Chip } from "./ui";

export function PanelCard({ panel }: { panel: Panel }) {
  const selectedPanelId = useStudio((s) => s.selectedPanelId);
  const highlight = useStudio((s) => s.highlightPanelIds);
  const composition = useStudio((s) => s.compositionOverlay);
  const selectPanel = useStudio((s) => s.selectPanel);
  const allComments = useStudio((s) => s.project.comments);
  const comments = allComments.filter((c) => c.panelId === panel.id && !c.resolved);

  const isSelected = selectedPanelId === panel.id;
  const isHighlighted = highlight.includes(panel.id);

  return (
    <button
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-lg border bg-card text-left transition-all",
        isSelected
          ? "border-ring ring-2 ring-ring/40"
          : isHighlighted
            ? "border-amber-500/60 ring-2 ring-amber-500/30"
            : "border-border hover:border-ring/50"
      )}
      onClick={() => selectPanel(panel.id)}
      type="button"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <ShotFrame panel={panel} showComposition={composition} />
        <div className="absolute top-1.5 left-1.5">
          <span className="rounded bg-black/70 px-1.5 py-0.5 font-mono font-semibold text-[11px] text-white backdrop-blur">
            {panel.shotNumber}
          </span>
        </div>
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {comments.length > 0 && (
            <span className="flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
              <MessageSquare className="size-2.5" /> {comments.length}
            </span>
          )}
          <span className="rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur">
            {panel.duration}s
          </span>
        </div>
        <div className="absolute bottom-1.5 left-1.5 flex flex-wrap gap-1">
          <Chip tone="accent">{panel.shotType}</Chip>
          {panel.movement !== "static" && (
            <span className="inline-flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white uppercase backdrop-blur">
              <Move className="size-2.5" />
              {movementLabel(panel.movement).split(" ")[0]}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-2.5">
        <div className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <Chip tone="muted">{angleLabel(panel.angle)}</Chip>
          <Chip tone="muted">{panel.lens}</Chip>
        </div>
        {panel.dialogue.trim() && (
          <p className="line-clamp-2 border-border/60 border-l-2 pl-2 text-[11px] text-foreground/90 italic">
            {panel.dialogue.split("\n").slice(-1)[0]}
          </p>
        )}
        {panel.action.trim() && (
          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {panel.action}
          </p>
        )}
      </div>
    </button>
  );
}
