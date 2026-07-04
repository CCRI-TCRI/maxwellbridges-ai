"use client";
// Sinclaire Storion — Timeline & Animatic preview
import { Pause, Play, SkipBack } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio/store";
import type { Panel } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { ShotFrame } from "./shot-frame";
import { EmptyState } from "./ui";

const PX_PER_SEC = 34;

export function TimelineView() {
  const project = useStudio((s) => s.project);
  const selectPanel = useStudio((s) => s.selectPanel);
  const selectedPanelId = useStudio((s) => s.selectedPanelId);
  const updatePanel = useStudio((s) => s.updatePanel);

  const ordered = project.scenes.flatMap((scene) =>
    project.panels.filter((p) => p.sceneId === scene.id).sort((a, b) => a.order - b.order)
  );
  const totalDur = ordered.reduce((a, p) => a + p.duration, 0);

  // Animatic playback
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState(0); // seconds
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      setClock((c) => {
        const next = c + dt;
        if (next >= totalDur) {
          setPlaying(false);
          return totalDur;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, totalDur]);

  // current panel from clock
  let acc = 0;
  let currentPanel: Panel | null = null;
  for (const p of ordered) {
    if (clock >= acc && clock < acc + p.duration) {
      currentPanel = p;
      break;
    }
    acc += p.duration;
  }
  if (!currentPanel && ordered.length) currentPanel = ordered[ordered.length - 1];

  const resize = (panel: Panel, e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startDur = panel.duration;
    const move = (ev: PointerEvent) => {
      const delta = (ev.clientX - startX) / PX_PER_SEC;
      updatePanel(panel.id, { duration: Math.max(0.5, Math.round((startDur + delta) * 2) / 2) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (ordered.length === 0) {
    return <EmptyState title="Nothing on the timeline" hint="Add shots to see them laid out in time." />;
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="flex h-full flex-col">
      {/* Animatic viewer */}
      <div className="flex items-center gap-4 border-border/60 border-b bg-card/40 p-4">
        <div className="aspect-video w-64 shrink-0 overflow-hidden rounded-md border border-border">
          {currentPanel && <ShotFrame panel={currentPanel} />}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={() => setPlaying((p) => !p)} size="icon-sm" variant="outline">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button onClick={() => { setClock(0); setPlaying(false); }} size="icon-sm" variant="ghost">
              <SkipBack className="size-4" />
            </Button>
            <span className="font-mono text-muted-foreground text-sm">
              {fmt(clock)} / {fmt(totalDur)}
            </span>
            {currentPanel && (
              <span className="ml-2 font-mono font-semibold text-sm">
                {currentPanel.shotNumber} · {currentPanel.shotType}
              </span>
            )}
          </div>
          {currentPanel?.dialogue && (
            <p className="text-muted-foreground text-sm italic">
              {currentPanel.dialogue.split("\n").slice(-1)[0]}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            {ordered.length} shots · estimated runtime {fmt(totalDur)}. Drag a clip's right edge to retime it.
          </p>
        </div>
      </div>

      {/* Timeline track */}
      <div className="flex-1 overflow-auto p-4">
        <div className="relative" style={{ width: totalDur * PX_PER_SEC + 40 }}>
          {/* ruler */}
          <div className="relative mb-1 h-5">
            {Array.from({ length: Math.ceil(totalDur) + 1 }).map((_, i) => (
              <div className="absolute top-0 text-[9px] text-muted-foreground" key={i} style={{ left: i * PX_PER_SEC }}>
                <div className="h-1.5 w-px bg-border" />
                {i % 5 === 0 && <span>{i}s</span>}
              </div>
            ))}
          </div>

          <div className="relative flex h-24 items-stretch">
            {ordered.map((panel) => {
              const scene = project.scenes.find((s) => s.id === panel.sceneId);
              const w = panel.duration * PX_PER_SEC;
              return (
                <div
                  className={cn(
                    "group relative flex shrink-0 flex-col overflow-hidden rounded-md border transition-colors",
                    selectedPanelId === panel.id ? "border-ring ring-2 ring-ring/40" : "border-border hover:border-ring/50"
                  )}
                  key={panel.id}
                  onClick={() => selectPanel(panel.id)}
                  style={{ width: w, marginRight: 3 }}
                >
                  <div className="relative h-14 w-full overflow-hidden bg-black">
                    <ShotFrame panel={panel} />
                    <span className="absolute top-0.5 left-0.5 rounded bg-black/70 px-1 font-mono text-[9px] text-white">
                      {panel.shotNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground">{panel.shotType}</span>
                    <span className="font-mono text-[9px]">{panel.duration}s</span>
                  </div>
                  {/* resize handle */}
                  <div
                    className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize bg-ring/0 hover:bg-ring/60"
                    onPointerDown={(e) => resize(panel, e)}
                  />
                </div>
              );
            })}
          </div>

          {/* playhead */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-sky-400"
            style={{ left: clock * PX_PER_SEC }}
          >
            <div className="-translate-x-1/2 -top-1 absolute size-2 rounded-full bg-sky-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
