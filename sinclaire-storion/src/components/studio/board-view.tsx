// Sinclaire Storion — Intelligent Storyboard Canvas (Konva infinite canvas)
import Konva from "konva";
import { Clapperboard, Maximize, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { useStudio } from "@/lib/studio/store";
import { angleLabel } from "@/lib/studio/constants";
import type { Panel, Scene } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./ui";
import { KonvaFrame } from "./konva-frame";

const CARD_W = 260;
const PAD = 8;
const FRAME_H = ((CARD_W - PAD * 2) * 9) / 16;
const TEXT_H = 70;
const CARD_H = PAD * 2 + FRAME_H + TEXT_H;
const GAP_X = 26;
const GAP_Y = 30;
const HEADER_H = 44;
const SCENE_GAP = 30;
const COLS = 4;

function PanelCardKonva({ panel, x, y, selected, highlighted, onSelect, onOpen }: {
  panel: Panel;
  x: number;
  y: number;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const frameW = CARD_W - PAD * 2;
  const stroke = selected ? "#3b82f6" : highlighted ? "#f59e0b" : "rgba(255,255,255,0.12)";
  const dialogue = panel.dialogue.split("\n").slice(-1)[0] ?? "";
  return (
    <Group x={x} y={y} onClick={onSelect} onTap={onSelect} onDblClick={onOpen} onDblTap={onOpen}>
      <Rect width={CARD_W} height={CARD_H} cornerRadius={10} fill="#111318" stroke={stroke} strokeWidth={selected || highlighted ? 2 : 1} shadowColor="black" shadowBlur={selected ? 16 : 6} shadowOpacity={0.4} />
      <Group clipX={PAD} clipY={PAD} clipWidth={frameW} clipHeight={FRAME_H}>
        <KonvaFrame panel={panel} x={PAD} y={PAD} width={frameW} />
      </Group>
      {/* shot number badge */}
      <Rect x={PAD + 4} y={PAD + 4} width={34} height={18} cornerRadius={4} fill="rgba(0,0,0,0.7)" />
      <Text x={PAD + 4} y={PAD + 8} width={34} align="center" text={panel.shotNumber} fontSize={11} fontStyle="bold" fill="#fff" fontFamily="monospace" />
      {/* duration */}
      <Rect x={PAD + frameW - 34} y={PAD + 4} width={30} height={18} cornerRadius={4} fill="rgba(0,0,0,0.7)" />
      <Text x={PAD + frameW - 34} y={PAD + 8} width={30} align="center" text={`${panel.duration}s`} fontSize={10} fill="#fff" fontFamily="monospace" />
      {/* shot type chip */}
      <Rect x={PAD + 4} y={PAD + FRAME_H - 22} width={40} height={16} cornerRadius={3} fill="rgba(59,130,246,0.25)" />
      <Text x={PAD + 4} y={PAD + FRAME_H - 19} width={40} align="center" text={panel.shotType} fontSize={9} fontStyle="bold" fill="#93c5fd" fontFamily="monospace" />
      {/* meta line */}
      <Text x={PAD} y={PAD + FRAME_H + 8} width={frameW} text={`${angleLabel(panel.angle)} · ${panel.lens} · ${panel.movement}`} fontSize={10} fill="#8a8f9a" ellipsis wrap="none" />
      {dialogue && <Text x={PAD} y={PAD + FRAME_H + 24} width={frameW} text={dialogue} fontSize={11} fontStyle="italic" fill="#d6d9de" ellipsis wrap="none" />}
      {panel.action && <Text x={PAD} y={PAD + FRAME_H + 40} width={frameW} text={panel.action} fontSize={10} fill="#8a8f9a" ellipsis wrap="none" />}
    </Group>
  );
}

export function BoardView() {
  const project = useStudio((s) => s.project);
  const selectedSceneId = useStudio((s) => s.selectedSceneId);
  const selectedPanelId = useStudio((s) => s.selectedPanelId);
  const highlight = useStudio((s) => s.highlightPanelIds);
  const selectPanel = useStudio((s) => s.selectPanel);
  const addPanel = useStudio((s) => s.addPanel);
  const addScene = useStudio((s) => s.addScene);
  const selectScene = useStudio((s) => s.selectScene);
  const setView = useStudio((s) => s.setView);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const scenes = selectedSceneId ? project.scenes.filter((s) => s.id === selectedSceneId) : project.scenes;

  // Layout
  type Item = { type: "header"; scene: Scene; x: number; y: number } | { type: "panel"; panel: Panel; x: number; y: number };
  const items: Item[] = [];
  let cursorY = 0;
  for (const scene of scenes) {
    items.push({ type: "header", scene, x: 0, y: cursorY });
    cursorY += HEADER_H;
    const panels = project.panels.filter((p) => p.sceneId === scene.id).sort((a, b) => a.order - b.order);
    panels.forEach((panel, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      items.push({ type: "panel", panel, x: col * (CARD_W + GAP_X), y: cursorY + row * (CARD_H + GAP_Y) });
    });
    const rows = Math.max(1, Math.ceil(panels.length / COLS));
    cursorY += rows * (CARD_H + GAP_Y) + SCENE_GAP;
  }

  const resetView = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.position({ x: 40, y: 30 });
    stage.scale({ x: 1, y: 1 });
    setScale(1);
    stage.batchDraw();
  };

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(2.5, Math.max(0.25, oldScale * (direction > 0 ? 1.08 : 1 / 1.08)));
    stage.scale({ x: newScale, y: newScale });
    stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
    setScale(newScale);
    stage.batchDraw();
  };

  if (project.scenes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <EmptyState icon={<Clapperboard className="size-10" />} title="No scenes yet" hint="Import a screenplay or add a scene to start building your board." />
        <Button onClick={() => selectScene(addScene())} variant="outline"><Plus className="size-4" /> Add Scene</Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      {/* Floating toolbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-xs backdrop-blur">
          <span className="text-muted-foreground">Scroll to zoom · drag to pan · double-click a shot to design it</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="rounded-md border border-border bg-card/80 px-2 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur">{Math.round(scale * 100)}%</span>
          <Button onClick={resetView} size="icon-sm" variant="outline" title="Reset view"><Maximize className="size-4" /></Button>
          <Button onClick={() => { const scene = scenes[0] ?? project.scenes[0]; selectPanel(addPanel(scene.id)); }} size="sm" variant="outline"><Plus className="size-4" /> Shot</Button>
          <Button onClick={() => selectScene(addScene())} size="sm" variant="outline"><Plus className="size-4" /> Scene</Button>
        </div>
      </div>

      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        draggable
        x={40}
        y={30}
        onWheel={onWheel}
        onClick={(e) => { if (e.target === e.target.getStage()) selectPanel(null); }}
        style={{ background: "transparent", cursor: "grab" }}
      >
        <Layer>
          {items.map((it, i) =>
            it.type === "header" ? (
              <Group key={`h-${it.scene.id}`} x={it.x} y={it.y}>
                <Rect x={0} y={6} width={30} height={22} cornerRadius={5} fill="#e5e7eb" />
                <Text x={0} y={11} width={30} align="center" text={`SC${it.scene.number}`} fontSize={10} fontStyle="bold" fill="#111318" fontFamily="monospace" />
                <Text x={40} y={8} text={it.scene.heading} fontSize={16} fontStyle="bold" fill="#f4f4f5" />
                <Text x={40} y={28} text={`${project.panels.filter((p) => p.sceneId === it.scene.id).length} shots`} fontSize={11} fill="#8a8f9a" />
              </Group>
            ) : (
              <PanelCardKonva
                key={it.panel.id}
                panel={it.panel}
                x={it.x}
                y={it.y}
                selected={selectedPanelId === it.panel.id}
                highlighted={highlight.includes(it.panel.id)}
                onSelect={() => selectPanel(it.panel.id)}
                onOpen={() => { selectPanel(it.panel.id); setView("designer"); }}
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
}
