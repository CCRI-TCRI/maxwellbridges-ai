// Sinclaire Storion — screenplay parser
// Splits a pasted screenplay into scenes, detects characters & locations,
// and suggests an opening set of shots for each scene.
import { nanoid } from "nanoid";
import { CHARACTER_COLORS } from "./constants";
import type { Character, Panel, Scene, ShotType, StagePosition } from "./types";
import { blankCamera } from "./factory";

const SCENE_HEADING = /^\s*(INT\.?\/EXT\.?|INT\.?|EXT\.?|EST\.?)\s+(.*)$/i;
const TRANSITION = /^\s*(CUT TO:|FADE (IN|OUT)|DISSOLVE TO:|SMASH CUT:|FADE TO BLACK)/i;

function isCharacterCue(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 40) return false;
  // Mostly uppercase, no ending punctuation typical of action.
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length < 2) return false;
  const upper = t.replace(/[^A-Z]/g, "");
  const isUpper = upper.length >= letters.length * 0.85;
  return isUpper && !SCENE_HEADING.test(t) && !TRANSITION.test(t) && !t.endsWith(".");
}

function parseHeading(raw: string): {
  interiorExterior: Scene["interiorExterior"];
  location: string;
  timeOfDay: string;
} {
  const m = raw.match(SCENE_HEADING);
  let ie: Scene["interiorExterior"] = "INT";
  let rest = raw;
  if (m) {
    const prefix = m[1].toUpperCase();
    ie = prefix.startsWith("INT.?/EXT") || prefix.includes("/") ? "INT/EXT" : prefix.startsWith("EXT") ? "EXT" : "INT";
    rest = m[2] ?? "";
  }
  // Split "LOCATION - TIME"
  const parts = rest.split(/\s+[-–—]\s+/);
  const location = (parts[0] ?? "").trim().replace(/\s+/g, " ");
  const timeOfDay = (parts.slice(1).join(" - ") || "DAY").trim().toUpperCase();
  return { interiorExterior: ie, location: location || "UNKNOWN LOCATION", timeOfDay };
}

// Heuristic: choose a shot pattern for a scene based on its content.
function suggestShots(sceneCharacters: string[], hasDialogue: boolean): ShotType[] {
  if (sceneCharacters.length === 0) return ["WS", "MS"];
  if (sceneCharacters.length === 1) {
    return hasDialogue ? ["WS", "MS", "CU"] : ["WS", "MWS", "MS"];
  }
  // Conversation: establishing + coverage
  return hasDialogue ? ["WS", "MS", "OTS", "OTS", "CU"] : ["WS", "MS", "MWS"];
}

export interface ParseResult {
  scenes: Scene[];
  panels: Panel[];
  characters: Character[];
}

export function parseScreenplay(text: string): ParseResult {
  const lines = text.replace(/\r/g, "").split("\n");
  const scenes: Scene[] = [];
  const panels: Panel[] = [];
  const characterMap = new Map<string, Character>();

  let current: Scene | null = null;
  let sceneChars: Set<string> = new Set();
  let sceneAction: string[] = [];
  let sceneHasDialogue = false;
  let sceneNumber = 0;

  const colorFor = (name: string) => {
    const idx = characterMap.size % CHARACTER_COLORS.length;
    return CHARACTER_COLORS[idx];
  };

  const flushScene = () => {
    if (!current) return;
    current.synopsis = sceneAction.join(" ").slice(0, 240);
    scenes.push(current);
    // Build suggested panels
    const charList = Array.from(sceneChars);
    const shots = suggestShots(charList, sceneHasDialogue);
    shots.forEach((shotType, i) => {
      const stage: StagePosition[] = charList.slice(0, 3).map((cn, idx, arr) => {
        const spread = arr.length === 1 ? 0.5 : 0.3 + (idx / Math.max(1, arr.length - 1)) * 0.4;
        const ch = characterMap.get(cn);
        return {
          id: nanoid(8),
          characterId: ch?.id ?? null,
          label: cn,
          x: spread,
          y: 0.55,
          facing: idx % 2 === 0 ? "three-quarter-right" : "three-quarter-left",
          pose: "standing",
          scale: 1,
          color: ch?.color ?? "#a0a8b8",
        } as StagePosition;
      });
      panels.push({
        id: nanoid(10),
        sceneId: current!.id,
        shotNumber: `${current!.number}${String.fromCharCode(65 + i)}`,
        order: i,
        shotType,
        angle: "eye-level",
        movement: i === 0 ? "static" : shotType === "CU" ? "dolly-in" : "static",
        lens: shotType === "CU" || shotType === "ECU" ? "85mm" : shotType === "WS" || shotType === "EWS" ? "24mm" : "35mm",
        dialogue: "",
        action: i === 0 ? current!.synopsis.slice(0, 120) : "",
        notes: "",
        duration: shotType === "WS" ? 4 : shotType === "CU" ? 2.5 : 3,
        stage,
        camera: blankCamera(shotType),
      });
    });
    // reset
    sceneChars = new Set();
    sceneAction = [];
    sceneHasDialogue = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;

    if (SCENE_HEADING.test(line) && line.length < 90) {
      flushScene();
      sceneNumber += 1;
      const h = parseHeading(line);
      current = {
        id: nanoid(10),
        number: sceneNumber,
        heading: line.replace(/\s+/g, " ").toUpperCase(),
        location: h.location,
        timeOfDay: h.timeOfDay,
        interiorExterior: h.interiorExterior,
        synopsis: "",
        objective: "",
        emotionalTone: "",
        musicIdeas: "",
        lightingNotes: "",
        costumeNotes: "",
        propList: [],
        references: [],
        moodImages: [],
      };
      continue;
    }

    if (TRANSITION.test(line)) continue;

    if (isCharacterCue(line)) {
      // Character cue — next non-empty lines are dialogue.
      const name = line.replace(/\(.*?\)/g, "").trim().toUpperCase();
      if (name && name.length <= 30) {
        if (!characterMap.has(name)) {
          characterMap.set(name, {
            id: nanoid(10),
            name,
            color: colorFor(name),
            height: "",
            clothing: "",
            hairstyle: "",
            accessories: "",
            expressionDefault: "neutral",
            notes: "",
          });
        }
        if (current) sceneChars.add(name);
        sceneHasDialogue = true;
      }
      continue;
    }

    // Otherwise: action / description
    if (current) sceneAction.push(line);
  }
  flushScene();

  return { scenes, panels, characters: Array.from(characterMap.values()) };
}
