// Sinclaire Storion — Story Brain
// Analyzes a storyboard and surfaces filmmaking insights the way an
// experienced assistant director would. It never rewrites the vision —
// it notices technical & storytelling opportunities.
import { shotTypeLabel } from "./constants";
import type { Facing, Panel, Project, Scene, ShotType, StoryBrainInsight } from "./types";

const CLOSE_SHOTS: ShotType[] = ["CU", "ECU", "MCU"];
const WIDE_SHOTS: ShotType[] = ["EWS", "WS", "MWS"];

function facingSide(f: Facing): -1 | 0 | 1 {
  if (f === "left" || f === "three-quarter-left") return -1;
  if (f === "right" || f === "three-quarter-right") return 1;
  return 0;
}

function dominantFacing(panel: Panel): -1 | 0 | 1 {
  const people = panel.stage.filter((s) => !s.isProp);
  if (people.length === 0) return 0;
  const sum = people.reduce((acc, p) => acc + facingSide(p.facing), 0);
  return (Math.sign(sum) as -1 | 0 | 1);
}

// Which side of the subject-axis the camera sits on (for the 180° rule).
function cameraSide(panel: Panel): -1 | 0 | 1 {
  const people = panel.stage.filter((s) => !s.isProp);
  if (people.length < 2) return 0;
  const sorted = [...people].sort((a, b) => a.x - b.x);
  const a = sorted[0];
  const b = sorted[sorted.length - 1];
  // Cross product of the A→B axis with A→camera vector.
  const axis = { x: b.x - a.x, y: b.y - a.y };
  const cam = { x: panel.camera.x - a.x, y: panel.camera.y - a.y };
  const cross = axis.x * cam.y - axis.y * cam.x;
  return (Math.sign(cross) as -1 | 0 | 1);
}

export function analyzeProject(project: Project): StoryBrainInsight[] {
  const insights: StoryBrainInsight[] = [];
  const push = (i: Omit<StoryBrainInsight, "id">) =>
    insights.push({ ...i, id: `${i.category}-${(i.panelIds[0] ?? i.sceneId) ?? "x"}-${insights.length}` });

  for (const scene of project.scenes) {
    const panels = project.panels
      .filter((p) => p.sceneId === scene.id)
      .sort((a, b) => a.order - b.order);
    if (panels.length === 0) {
      push({
        sceneId: scene.id,
        panelIds: [],
        severity: "warning",
        category: "coverage",
        title: `Scene ${scene.number} has no shots`,
        detail: `"${scene.heading}" has no coverage yet. Add at least an establishing shot so the scene reads on the board.`,
      });
      continue;
    }

    // 1) Consecutive identical shot sizes
    let runStart = 0;
    for (let i = 1; i <= panels.length; i++) {
      if (i < panels.length && panels[i].shotType === panels[runStart].shotType) continue;
      const runLen = i - runStart;
      if (runLen >= 4) {
        const run = panels.slice(runStart, i);
        const type = run[0].shotType;
        const isDialogue = run.some((p) => p.dialogue.trim().length > 0);
        push({
          sceneId: scene.id,
          panelIds: run.map((p) => p.id),
          severity: "suggestion",
          category: "coverage",
          title: `${runLen} consecutive ${shotTypeLabel(type)}s`,
          detail: isDialogue
            ? `This conversation uses ${runLen} straight ${shotTypeLabel(type)}s. Consider cutting to a ${CLOSE_SHOTS.includes(type) ? "wide or reaction" : "close-up"} for emphasis and rhythm.`
            : `${runLen} shots of the same size in a row can feel flat. Vary the framing to keep the eye engaged.`,
        });
      }
      runStart = i;
    }

    // 2) Screen-direction continuity (character flips sides / facing)
    for (let i = 1; i < panels.length; i++) {
      const prev = panels[i - 1];
      const cur = panels[i];
      const fPrev = dominantFacing(prev);
      const fCur = dominantFacing(cur);
      if (fPrev !== 0 && fCur !== 0 && fPrev !== fCur) {
        push({
          sceneId: scene.id,
          panelIds: [prev.id, cur.id],
          severity: "warning",
          category: "screen-direction",
          title: `Screen direction flips at ${cur.shotNumber}`,
          detail: `The subject faces ${fPrev < 0 ? "left" : "right"} in ${prev.shotNumber} but ${fCur < 0 ? "left" : "right"} in ${cur.shotNumber}. Unless it's a deliberate reverse, this can disorient the audience.`,
        });
      }
    }

    // 3) 180-degree rule — camera crosses the line
    for (let i = 1; i < panels.length; i++) {
      const a = cameraSide(panels[i - 1]);
      const b = cameraSide(panels[i]);
      if (a !== 0 && b !== 0 && a !== b) {
        push({
          sceneId: scene.id,
          panelIds: [panels[i - 1].id, panels[i].id],
          severity: "warning",
          category: "continuity",
          title: `Possible 180° line crossing at ${panels[i].shotNumber}`,
          detail: `The camera appears to jump to the opposite side of the subject axis between ${panels[i - 1].shotNumber} and ${panels[i].shotNumber}, which can swap left/right screen positions. Add a neutral cutaway or keep the camera on one side.`,
        });
      }
    }

    // 4) Coverage in a dialogue scene
    const dialoguePanels = panels.filter((p) => p.dialogue.trim().length > 0);
    if (dialoguePanels.length >= 2) {
      const hasClose = panels.some((p) => CLOSE_SHOTS.includes(p.shotType));
      if (!hasClose) {
        push({
          sceneId: scene.id,
          panelIds: dialoguePanels.map((p) => p.id),
          severity: "suggestion",
          category: "emphasis",
          title: `Dialogue with no close-up`,
          detail: `Scene ${scene.number} carries dialogue but never pushes closer than a medium. A reaction close-up after a key line strengthens the audience's connection.`,
        });
      }
    }

    // 5) Establishing shot missing
    if (panels.length >= 3 && !panels.slice(0, 2).some((p) => WIDE_SHOTS.includes(p.shotType))) {
      push({
        sceneId: scene.id,
        panelIds: [panels[0].id],
        severity: "info",
        category: "coverage",
        title: `No establishing shot`,
        detail: `Scene ${scene.number} opens without a wide. An establishing shot orients the audience in "${scene.location}" before you go tight.`,
      });
    }

    // 6) Pacing — uniform durations
    const durs = panels.map((p) => p.duration);
    const allSame = durs.every((d) => Math.abs(d - durs[0]) < 0.01);
    if (panels.length >= 4 && allSame) {
      push({
        sceneId: scene.id,
        panelIds: panels.map((p) => p.id),
        severity: "info",
        category: "rhythm",
        title: `Every shot is the same length`,
        detail: `All ${panels.length} shots in scene ${scene.number} run ${durs[0]}s. Varying shot length shapes the pacing — shorten for tension, hold for weight.`,
      });
    }

    // 7) Emotional peak without a push-in
    const tone = scene.emotionalTone.toLowerCase();
    if (/climax|peak|reveal|confront|breakdown|turning/.test(tone)) {
      const hasPush = panels.some((p) => p.movement === "dolly-in" || CLOSE_SHOTS.includes(p.shotType));
      if (!hasPush) {
        push({
          sceneId: scene.id,
          panelIds: panels.map((p) => p.id),
          severity: "suggestion",
          category: "emphasis",
          title: `Emotional peak could land harder`,
          detail: `You marked this scene's tone as "${scene.emotionalTone}". The moment might have more impact if the camera pushes in (dolly-in) on the emotional peak.`,
        });
      }
    }

    // 8) Very long scene — momentum
    const totalDur = durs.reduce((a, b) => a + b, 0);
    if (totalDur > 45 && !panels.some((p) => p.shotType === "INSERT")) {
      push({
        sceneId: scene.id,
        panelIds: [],
        severity: "info",
        category: "pacing",
        title: `Scene runs long (${Math.round(totalDur)}s)`,
        detail: `Scene ${scene.number} is on the longer side. A cutaway or insert could improve momentum and give you an editing pressure-valve.`,
      });
    }
  }

  // Global: repetitive shot vocabulary across the whole project
  const typeCounts = new Map<ShotType, number>();
  for (const p of project.panels) typeCounts.set(p.shotType, (typeCounts.get(p.shotType) ?? 0) + 1);
  const total = project.panels.length;
  if (total >= 8) {
    for (const [type, count] of typeCounts) {
      if (count / total > 0.6) {
        push({
          sceneId: null,
          panelIds: [],
          severity: "info",
          category: "coverage",
          title: `Shot vocabulary leans heavily on ${shotTypeLabel(type)}`,
          detail: `${Math.round((count / total) * 100)}% of the whole board is ${shotTypeLabel(type)}. A wider range of shot sizes gives the edit more options.`,
        });
      }
    }
  }

  const order = { warning: 0, suggestion: 1, info: 2 } as const;
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}
