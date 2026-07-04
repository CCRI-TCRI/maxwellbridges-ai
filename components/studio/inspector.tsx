"use client";
// Sinclaire Storion — Inspector panel (edit selected shot)
import { Check, Copy, MousePointerClick, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CAMERA_ANGLES,
  CAMERA_MOVEMENTS,
  LENSES,
  SHOT_TYPES,
} from "@/lib/studio/constants";
import { analyzePanelComposition } from "@/lib/studio/composition";
import { useStudio } from "@/lib/studio/store";
import { cn } from "@/lib/utils";
import { ShotFrame } from "./shot-frame";
import { Field, SectionTitle, Select, TextArea, TextInput } from "./ui";

export function Inspector() {
  const panelId = useStudio((s) => s.selectedPanelId);
  const panel = useStudio((s) => s.project.panels.find((p) => p.id === panelId) ?? null);
  const scene = useStudio((s) => s.project.scenes.find((sc) => sc.id === panel?.sceneId));
  const composition = useStudio((s) => s.compositionOverlay);
  const toggleComposition = useStudio((s) => s.toggleComposition);
  const update = useStudio((s) => s.updatePanel);
  const duplicate = useStudio((s) => s.duplicatePanel);
  const del = useStudio((s) => s.deletePanel);
  const setView = useStudio((s) => s.setView);

  if (!panel) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <MousePointerClick className="size-8 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">Select a shot to inspect & edit it.</p>
      </div>
    );
  }

  const notes = analyzePanelComposition(panel);

  return (
    <div className="flex h-full flex-col">
      <SectionTitle
        right={
          <div className="flex items-center gap-1">
            <Button className="size-7" onClick={() => duplicate(panel.id)} size="icon-sm" title="Duplicate" variant="ghost">
              <Copy className="size-3.5" />
            </Button>
            <Button
              className="size-7 text-destructive"
              onClick={() => del(panel.id)}
              size="icon-sm"
              title="Delete"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        }
      >
        Shot {panel.shotNumber}
      </SectionTitle>

      <div className="flex-1 overflow-y-auto">
        {/* Live frame preview */}
        <div className="relative m-3 overflow-hidden rounded-lg border border-border">
          <div className="aspect-video">
            <ShotFrame panel={panel} showComposition={composition} />
          </div>
          <button
            className={cn(
              "absolute right-2 bottom-2 rounded px-2 py-1 text-[10px] uppercase tracking-wide backdrop-blur",
              composition ? "bg-sky-500/80 text-white" : "bg-black/60 text-white/80"
            )}
            onClick={toggleComposition}
            type="button"
          >
            Composition guides
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 p-3 pt-0">
          <Field label="Shot #">
            <TextInput onChange={(e) => update(panel.id, { shotNumber: e.target.value })} value={panel.shotNumber} />
          </Field>
          <Field label="Duration (s)">
            <TextInput
              min={0}
              onChange={(e) => update(panel.id, { duration: Math.max(0, Number(e.target.value) || 0) })}
              step={0.5}
              type="number"
              value={panel.duration}
            />
          </Field>
          <Field label="Shot type">
            <Select
              onChange={(v) => update(panel.id, { shotType: v as never, camera: { ...panel.camera, shotType: v as never } })}
              options={SHOT_TYPES.map((s) => ({ value: s.value, label: s.label }))}
              value={panel.shotType}
            />
          </Field>
          <Field label="Camera angle">
            <Select
              onChange={(v) => update(panel.id, { angle: v as never, camera: { ...panel.camera, angle: v as never } })}
              options={CAMERA_ANGLES.map((a) => ({ value: a.value, label: a.label }))}
              value={panel.angle}
            />
          </Field>
          <Field label="Movement">
            <Select
              onChange={(v) => update(panel.id, { movement: v as never })}
              options={CAMERA_MOVEMENTS.map((m) => ({ value: m.value, label: m.label }))}
              value={panel.movement}
            />
          </Field>
          <Field label="Lens">
            <Select
              onChange={(v) => update(panel.id, { lens: v as never, camera: { ...panel.camera, lens: v as never } })}
              options={LENSES.map((l) => ({ value: l.value, label: `${l.label} — ${l.hint.split("—")[0].trim()}` }))}
              value={panel.lens}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2.5 px-3 pb-3">
          <Field label="Dialogue">
            <TextArea
              onChange={(e) => update(panel.id, { dialogue: e.target.value })}
              placeholder="CHARACTER&#10;Line of dialogue…"
              value={panel.dialogue}
            />
          </Field>
          <Field label="Action">
            <TextArea
              onChange={(e) => update(panel.id, { action: e.target.value })}
              placeholder="What happens in the frame…"
              value={panel.action}
            />
          </Field>
          <Field label="Director's notes">
            <TextArea
              onChange={(e) => update(panel.id, { notes: e.target.value })}
              placeholder="Intent, blocking, references…"
              value={panel.notes}
            />
          </Field>
        </div>

        {/* Composition assistant */}
        <SectionTitle>Composition Assistant</SectionTitle>
        <ul className="flex flex-col gap-1.5 p-3">
          {notes.map((n) => (
            <li className="flex items-start gap-2 text-xs" key={n.label}>
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                  n.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                )}
              >
                {n.ok ? <Check className="size-2.5" /> : "!"}
              </span>
              <span>
                <span className="font-medium">{n.label}.</span>{" "}
                <span className="text-muted-foreground">{n.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="p-3 pt-0">
          <Button className="w-full" onClick={() => setView("designer")} size="sm" variant="outline">
            Open in Shot Designer
          </Button>
          {scene && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Scene {scene.number} · {scene.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
