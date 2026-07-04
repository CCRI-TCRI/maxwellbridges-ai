// Sinclaire Storion — domain model
// Property of Sinclaire Sebastian Studios. Made by Sseruwagi Sinclaire Sebastian.

export type ShotType =
  | "EWS" // extreme wide
  | "WS" // wide
  | "MWS" // medium wide
  | "MS" // medium
  | "MCU" // medium close up
  | "CU" // close up
  | "ECU" // extreme close up
  | "OTS" // over the shoulder
  | "POV" // point of view
  | "INSERT"; // insert / detail

export type CameraAngle =
  | "eye-level"
  | "high"
  | "low"
  | "dutch"
  | "birds-eye"
  | "worms-eye"
  | "over-shoulder";

export type CameraMovement =
  | "static"
  | "pan"
  | "tilt"
  | "dolly-in"
  | "dolly-out"
  | "tracking"
  | "crane"
  | "handheld"
  | "zoom"
  | "steadicam";

export type Lens = "14mm" | "24mm" | "35mm" | "50mm" | "85mm" | "135mm";

export type Facing = "left" | "right" | "front" | "back" | "three-quarter-left" | "three-quarter-right";

export type Pose = "standing" | "walking" | "sitting" | "crouching" | "lying" | "gesturing";

export interface StagePosition {
  id: string;
  characterId: string | null; // null => prop / marker
  label: string; // fallback display name (prop name or unknown character)
  x: number; // 0..1 normalized within stage
  y: number; // 0..1 (depth: 0 = far, 1 = near camera)
  facing: Facing;
  pose: Pose;
  scale: number; // relative size multiplier
  color: string; // token color
  isProp?: boolean;
}

export interface CameraState {
  x: number; // 0..1 position on stage
  y: number; // 0..1 depth
  targetX: number; // where the camera looks (0..1)
  targetY: number;
  shotType: ShotType;
  angle: CameraAngle;
  lens: Lens;
  height: number; // 0..1, framing height
}

export interface Panel {
  id: string;
  sceneId: string;
  shotNumber: string; // e.g. "12A"
  order: number;
  shotType: ShotType;
  angle: CameraAngle;
  movement: CameraMovement;
  lens: Lens;
  dialogue: string;
  action: string;
  notes: string; // director's notes
  duration: number; // seconds
  stage: StagePosition[];
  camera: CameraState;
  thumbnail?: string; // optional data-url sketch (future)
}

export interface Scene {
  id: string;
  number: number;
  heading: string; // slugline: INT. CHURCH - NIGHT
  location: string;
  timeOfDay: string; // DAY / NIGHT / DUSK...
  interiorExterior: "INT" | "EXT" | "INT/EXT";
  synopsis: string;
  // Director's notebook
  objective: string;
  emotionalTone: string;
  musicIdeas: string;
  lightingNotes: string;
  costumeNotes: string;
  propList: string[];
  references: string[]; // urls / notes
  moodImages: MoodImage[];
}

export interface MoodImage {
  id: string;
  url: string;
  caption: string;
  category: "lighting" | "costume" | "architecture" | "palette" | "camera" | "general";
}

export interface Character {
  id: string;
  name: string;
  color: string; // token color for stage marker
  height: string; // e.g. "6'1\""
  clothing: string;
  hairstyle: string;
  accessories: string;
  expressionDefault: string;
  notes: string;
}

export interface LocationPreset {
  id: string;
  name: string;
  type: string; // Bedroom, Office, Street...
  description: string;
  palette: string[]; // hex colors
  ambientLight: string;
}

export interface Comment {
  id: string;
  panelId: string;
  author: string;
  role: string; // Director, DP, Writer...
  body: string;
  createdAt: number;
  resolved: boolean;
}

export interface Project {
  id: string;
  title: string;
  logline: string;
  createdAt: number;
  updatedAt: number;
  scenes: Scene[];
  panels: Panel[];
  characters: Character[];
  locations: LocationPreset[];
  comments: Comment[];
}

export type StudioView =
  | "board"
  | "designer"
  | "timeline"
  | "flow"
  | "brain"
  | "library"
  | "notebook"
  | "production"
  | "import";

export interface StoryBrainInsight {
  id: string;
  sceneId: string | null;
  panelIds: string[];
  severity: "info" | "suggestion" | "warning";
  category:
    | "coverage"
    | "pacing"
    | "screen-direction"
    | "emphasis"
    | "composition"
    | "rhythm"
    | "continuity";
  title: string;
  detail: string;
}
