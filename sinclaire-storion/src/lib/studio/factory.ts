// Sinclaire Storion — object factories
import { nanoid } from "nanoid";
import { shotFraming } from "./constants";
import type {
  CameraState,
  Character,
  LocationPreset,
  Panel,
  Scene,
  ShotType,
  StagePosition,
} from "./types";

export function blankCamera(shotType: ShotType = "MS"): CameraState {
  return {
    x: 0.5,
    y: 0.05,
    targetX: 0.5,
    targetY: 0.55,
    shotType,
    angle: "eye-level",
    lens: "35mm",
    height: shotFraming(shotType),
  };
}

export function blankPanel(sceneId: string, order: number, shotNumber: string): Panel {
  return {
    id: nanoid(10),
    sceneId,
    shotNumber,
    order,
    shotType: "MS",
    angle: "eye-level",
    movement: "static",
    lens: "35mm",
    dialogue: "",
    action: "",
    notes: "",
    duration: 3,
    stage: [],
    camera: blankCamera("MS"),
  };
}

export function blankScene(number: number): Scene {
  return {
    id: nanoid(10),
    number,
    heading: `INT. NEW LOCATION - DAY`,
    location: "NEW LOCATION",
    timeOfDay: "DAY",
    interiorExterior: "INT",
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
}

export function blankCharacter(name = "New Character", color = "#a0a8b8"): Character {
  return {
    id: nanoid(10),
    name,
    color,
    height: "",
    clothing: "",
    hairstyle: "",
    accessories: "",
    expressionDefault: "neutral",
    notes: "",
  };
}

export function blankLocation(name = "New Location"): LocationPreset {
  return {
    id: nanoid(10),
    name,
    type: "Interior",
    description: "",
    palette: ["#2b2b33", "#4a4a55", "#8a7f6b"],
    ambientLight: "Soft key",
  };
}

export function stagePersonFrom(
  character: Character | null,
  label: string,
  x: number
): StagePosition {
  return {
    id: nanoid(8),
    characterId: character?.id ?? null,
    label: character?.name ?? label,
    x,
    y: 0.55,
    facing: "three-quarter-right",
    pose: "standing",
    scale: 1,
    color: character?.color ?? "#a0a8b8",
  };
}
