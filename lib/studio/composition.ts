// Sinclaire Storion — per-panel composition checks
import { shotFraming } from "./constants";
import type { Panel } from "./types";

export interface CompositionNote {
  ok: boolean;
  label: string;
  detail: string;
}

export function analyzePanelComposition(panel: Panel): CompositionNote[] {
  const notes: CompositionNote[] = [];
  const people = panel.stage.filter((s) => !s.isProp);
  const framing = shotFraming(panel.shotType);

  // Rule of thirds — is the primary subject near a third line?
  if (people.length > 0) {
    const primary = people.reduce((a, b) => (b.scale > a.scale ? b : a));
    const apparent = 0.5 + (primary.x - panel.camera.targetX) * ((1 - framing) * 1.7 + 0.42);
    const nearThird = [0.333, 0.667].some((t) => Math.abs(apparent - t) < 0.09);
    const centered = Math.abs(apparent - 0.5) < 0.07;
    notes.push({
      ok: nearThird || (centered && (panel.shotType === "CU" || panel.shotType === "ECU")),
      label: "Rule of thirds",
      detail: nearThird
        ? "Primary subject sits near a third line — strong composition."
        : centered
          ? "Subject is dead-center. Fine for symmetry/CU, otherwise nudge to a third."
          : "Subject drifts between thirds. Consider aligning to a power point.",
    });
  }

  // Headroom
  notes.push({
    ok: framing < 0.85,
    label: "Headroom",
    detail:
      framing >= 0.85
        ? "Very tight framing — watch that you're not cutting the forehead awkwardly."
        : "Comfortable headroom for this shot size.",
  });

  // Looking / screen direction room (nose room)
  if (people.length > 0) {
    const primary = people.reduce((a, b) => (b.scale > a.scale ? b : a));
    const looksLeft = primary.facing.includes("left");
    const looksRight = primary.facing.includes("right");
    const apparent = 0.5 + (primary.x - panel.camera.targetX) * ((1 - framing) * 1.7 + 0.42);
    let ok = true;
    let detail = "Balanced looking room.";
    if (looksRight && apparent > 0.6) {
      ok = false;
      detail = "Subject looks right but sits on the right — cramped nose room. Give space in the look direction.";
    } else if (looksLeft && apparent < 0.4) {
      ok = false;
      detail = "Subject looks left but sits on the left — cramped nose room. Reframe to open the look.";
    }
    notes.push({ ok, label: "Looking room", detail });
  }

  // Negative space / balance
  notes.push({
    ok: true,
    label: "Negative space",
    detail:
      people.length <= 1
        ? "Single subject leaves room to shape mood with negative space."
        : `${people.length} subjects — mind the balance of the frame and empty areas.`,
  });

  return notes;
}
