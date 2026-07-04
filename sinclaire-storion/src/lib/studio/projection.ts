// Sinclaire Storion — shared camera-framing projection.
// Deterministically maps a panel's staged characters into the camera frame.
import { shotFraming } from "./constants";
import type { Panel, StagePosition } from "./types";

export const FRAME_W = 320;
export const FRAME_H = 180; // 16:9

export interface ProjectedFigure {
  p: StagePosition;
  x: number; // px within FRAME_W
  h: number; // px height
  depth: number;
}

export function facingDir(f: StagePosition["facing"]): number {
  if (f === "left" || f === "three-quarter-left") return -1;
  if (f === "right" || f === "three-quarter-right") return 1;
  return 0;
}

export function projectPanel(panel: Panel): ProjectedFigure[] {
  const framing = shotFraming(panel.shotType);
  const spread = (1 - framing) * 1.7 + 0.42;
  const cam = panel.camera;
  return panel.stage
    .map((p) => {
      const depth = 0.7 + p.y * 0.55;
      const h = framing * FRAME_H * 1.15 * p.scale * depth;
      const x = FRAME_W * (0.5 + (p.x - cam.targetX) * spread);
      return { p, h, x, depth };
    })
    .filter((it) => it.x > -60 && it.x < FRAME_W + 60)
    .sort((a, b) => a.depth - b.depth);
}

export function horizonFor(angle: Panel["angle"]): number {
  if (angle === "high" || angle === "birds-eye") return FRAME_H * 0.72;
  if (angle === "low" || angle === "worms-eye") return FRAME_H * 0.34;
  return FRAME_H * 0.58;
}
