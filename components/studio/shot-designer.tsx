"use client";
// Sinclaire Storion — Shot Designer & Camera Simulator
// Top-down stage: drag characters and the camera; the storyboard frame
// updates instantly.
import { Plus, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CAMERA_ANGLES,
  FACINGS,
  LENSES,
  POSES,
  SHOT_TYPES,
} from "@/lib/studio/constants";
import { useStudio } from "@/lib/studio/store";
import type { Panel } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { ShotFrame } from "./shot-frame";
import { EmptyState, Field, Select } from "./ui";

type Drag =
  | { kind: "person"; id: string }
  | { kind: "camera" }
  | { kind: "target" }
  | null;

function StageEditor({ panel }: { panel: Panel }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag>(null);
  const updateStage = useStudio((s) => s.updateStagePosition);
  const updatePanel = useStudio((s) => s.updatePanel);
  const selectedPos = useStudio((s) => s.selectedPanelId);

  const toNorm = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const { x, y } = toNorm(e);
    if (drag.kind === "person") updateStage(panel.id, drag.id, { x, y });
    else if (drag.kind === "camera") updatePanel(panel.id, { camera: { ...panel.camera, x, y } });
    else if (drag.kind === "target") updatePanel(panel.id, { camera: { ...panel.camera, targetX: x, targetY: y } });
  };

  const cam = panel.camera;
  // Camera field-of-view cone toward target
  const angle = Math.atan2(cam.targetY - cam.y, cam.targetX - cam.x);
  const fov = 0.5; // radians half-angle
  const len = 0.9;
  const p1 = { x: cam.x + Math.cos(angle - fov) * len, y: cam.y + Math.sin(angle - fov) * len };
  const p2 = { x: cam.x + Math.cos(angle + fov) * len, y: cam.y + Math.sin(angle + fov) * len };

  return (
    <svg
      className="w-full touch-none select-none rounded-lg border border-border bg-[#0d1017]"
      onPointerLeave={() => setDrag(null)}
      onPointerMove={onMove}
      onPointerUp={() => setDrag(null)}
      ref={svgRef}
      role="application"
      style={{ aspectRatio: "1 / 0.72" }}
      viewBox="0 0 100 72"
    >
      {/* depth grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} x2={100} y1={g * 72} y2={g * 72} stroke="rgba(255,255,255,0.05)" strokeWidth={0.3} />
      ))}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={g * 100} x2={g * 100} y1={0} y2={72} stroke="rgba(255,255,255,0.05)" strokeWidth={0.3} />
      ))}
      <text x={2} y={5} fill="rgba(255,255,255,0.3)" fontSize={3}>FAR</text>
      <text x={2} y={70} fill="rgba(255,255,255,0.3)" fontSize={3}>NEAR / CAMERA</text>

      {/* FOV cone */}
      <polygon
        points={`${cam.x * 100},${cam.y * 72} ${p1.x * 100},${p1.y * 72} ${p2.x * 100},${p2.y * 72}`}
        fill="rgba(120,180,255,0.08)"
        stroke="rgba(120,180,255,0.25)"
        strokeWidth={0.3}
      />

      {/* subject axis (180° line) if two+ */}
      {(() => {
        const ppl = panel.stage.filter((s) => !s.isProp);
        if (ppl.length < 2) return null;
        const sorted = [...ppl].sort((a, b) => a.x - b.x);
        const a = sorted[0];
        const b = sorted[sorted.length - 1];
        return (
          <line
            x1={a.x * 100}
            y1={a.y * 72}
            x2={b.x * 100}
            y2={b.y * 72}
            stroke="rgba(255,120,120,0.35)"
            strokeDasharray="1.5 1.5"
            strokeWidth={0.3}
          />
        );
      })()}

      {/* people */}
      {panel.stage.map((p) => (
        <g
          key={p.id}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag({ kind: "person", id: p.id });
          }}
        >
          <circle cx={p.x * 100} cy={p.y * 72} fill={p.color} r={2.6 * p.scale} stroke="#000" strokeWidth={0.3} />
          {/* facing */}
          {p.facing !== "front" && p.facing !== "back" && (
            <line
              x1={p.x * 100}
              y1={p.y * 72}
              x2={p.x * 100 + (p.facing.includes("left") ? -3.5 : 3.5)}
              y2={p.y * 72}
              stroke="#fff"
              strokeWidth={0.5}
            />
          )}
          <text x={p.x * 100} y={p.y * 72 - 3.4} fill="#fff" fontSize={2.6} textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}

      {/* camera target handle */}
      <circle
        className="cursor-move"
        cx={cam.targetX * 100}
        cy={cam.targetY * 72}
        fill="none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ kind: "target" });
        }}
        r={2}
        stroke="rgba(120,180,255,0.8)"
        strokeWidth={0.5}
      />
      <line
        x1={cam.targetX * 100 - 2}
        y1={cam.targetY * 72}
        x2={cam.targetX * 100 + 2}
        y2={cam.targetY * 72}
        stroke="rgba(120,180,255,0.6)"
        strokeWidth={0.3}
      />

      {/* camera body */}
      <g
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ kind: "camera" });
        }}
        transform={`translate(${cam.x * 100} ${cam.y * 72}) rotate(${(angle * 180) / Math.PI})`}
      >
        <rect x={-2.4} y={-1.8} width={4.8} height={3.6} rx={0.6} fill="#eab308" stroke="#000" strokeWidth={0.3} />
        <polygon points="2.4,-1.2 4.2,-2 4.2,2 2.4,1.2" fill="#eab308" stroke="#000" strokeWidth={0.3} />
      </g>
    </svg>
  );
}

export function ShotDesigner() {
  const panelId = useStudio((s) => s.selectedPanelId);
  const panel = useStudio((s) => s.project.panels.find((p) => p.id === panelId) ?? null);
  const characters = useStudio((s) => s.project.characters);
  const composition = useStudio((s) => s.compositionOverlay);
  const update = useStudio((s) => s.updatePanel);
  const updateStage = useStudio((s) => s.updateStagePosition);
  const addPerson = useStudio((s) => s.addStagePerson);
  const removePerson = useStudio((s) => s.removeStagePerson);
  const [addId, setAddId] = useState("");

  if (!panel) {
    return (
      <EmptyState
        icon={<Video className="size-10" />}
        title="No shot selected"
        hint="Pick a shot on the board, then design its staging and camera here."
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      {/* Stage + live frame */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="mb-1 font-semibold text-sm">Top-down stage</h2>
          <p className="mb-2 text-muted-foreground text-xs">
            Drag characters, the camera (yellow), and its target (blue) to block the shot.
          </p>
          <StageEditor panel={panel} />
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-sm">Generated frame</h2>
          <div className="aspect-video overflow-hidden rounded-lg border border-border">
            <ShotFrame panel={panel} showComposition={composition} />
          </div>
        </div>
      </div>

      {/* Camera simulator + character controls */}
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="mb-2 font-semibold text-sm">Camera Simulator</h2>
          <div className="grid grid-cols-4 gap-1.5">
            {SHOT_TYPES.map((s) => (
              <button
                className={cn(
                  "rounded-md border px-2 py-2 text-xs transition-colors",
                  panel.shotType === s.value
                    ? "border-sky-500 bg-sky-500/15 text-sky-300"
                    : "border-border hover:border-ring/60"
                )}
                key={s.value}
                onClick={() =>
                  update(panel.id, { shotType: s.value, camera: { ...panel.camera, shotType: s.value } })
                }
                type="button"
              >
                <span className="block font-mono font-bold">{s.short}</span>
                <span className="block text-[9px] text-muted-foreground leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Field label="Angle">
              <Select
                onChange={(v) => update(panel.id, { angle: v as never, camera: { ...panel.camera, angle: v as never } })}
                options={CAMERA_ANGLES.map((a) => ({ value: a.value, label: a.label }))}
                value={panel.angle}
              />
            </Field>
            <Field label="Lens">
              <Select
                onChange={(v) => update(panel.id, { lens: v as never })}
                options={LENSES.map((l) => ({ value: l.value, label: l.label }))}
                value={panel.lens}
              />
            </Field>
            <Field label="Duration">
              <input
                className="w-full rounded-md border border-border bg-background/60 px-2 py-1.5 text-sm"
                min={0}
                onChange={(e) => update(panel.id, { duration: Math.max(0, Number(e.target.value) || 0) })}
                step={0.5}
                type="number"
                value={panel.duration}
              />
            </Field>
          </div>
        </div>

        {/* Cast on stage */}
        <div>
          <h2 className="mb-2 font-semibold text-sm">On stage</h2>
          <div className="flex flex-col gap-2">
            {panel.stage.length === 0 && (
              <p className="text-muted-foreground text-xs">No one on stage. Add a character below.</p>
            )}
            {panel.stage.map((p) => (
              <div className="flex items-center gap-2 rounded-md border border-border bg-card/50 p-2" key={p.id}>
                <span className="size-3 shrink-0 rounded-full" style={{ background: p.color }} />
                <span className="w-20 shrink-0 truncate font-medium text-xs">{p.label}</span>
                <Select
                  className="flex-1 py-1 text-xs"
                  onChange={(v) => updateStage(panel.id, p.id, { facing: v as never })}
                  options={FACINGS}
                  value={p.facing}
                />
                <Select
                  className="flex-1 py-1 text-xs"
                  onChange={(v) => updateStage(panel.id, p.id, { pose: v as never })}
                  options={POSES}
                  value={p.pose}
                />
                <button
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => removePerson(panel.id, p.id)}
                  type="button"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <select
              className="flex-1 rounded-md border border-border bg-background/60 px-2 py-1.5 text-sm"
              onChange={(e) => setAddId(e.target.value)}
              value={addId}
            >
              <option value="">Add character…</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__prop">＋ Prop / marker</option>
            </select>
            <Button
              disabled={!addId}
              onClick={() => {
                if (addId === "__prop") addPerson(panel.id, null, "Prop");
                else if (addId) addPerson(panel.id, addId, "");
                setAddId("");
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
