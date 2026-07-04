// Sinclaire Storion — cinematic vocabulary
import type {
  CameraAngle,
  CameraMovement,
  Facing,
  Lens,
  Pose,
  ShotType,
} from "./types";

export const SHOT_TYPES: { value: ShotType; label: string; short: string; framing: number }[] = [
  { value: "EWS", label: "Extreme Wide Shot", short: "EWS", framing: 0.14 },
  { value: "WS", label: "Wide Shot", short: "WS", framing: 0.28 },
  { value: "MWS", label: "Medium Wide", short: "MWS", framing: 0.42 },
  { value: "MS", label: "Medium Shot", short: "MS", framing: 0.6 },
  { value: "MCU", label: "Medium Close-Up", short: "MCU", framing: 0.74 },
  { value: "CU", label: "Close-Up", short: "CU", framing: 0.86 },
  { value: "ECU", label: "Extreme Close-Up", short: "ECU", framing: 0.96 },
  { value: "OTS", label: "Over the Shoulder", short: "OTS", framing: 0.66 },
  { value: "POV", label: "Point of View", short: "POV", framing: 0.55 },
  { value: "INSERT", label: "Insert / Detail", short: "INS", framing: 0.9 },
];

export const CAMERA_ANGLES: { value: CameraAngle; label: string; hint: string }[] = [
  { value: "eye-level", label: "Eye Level", hint: "Neutral, natural perspective" },
  { value: "high", label: "High Angle", hint: "Looks down — subject feels small/vulnerable" },
  { value: "low", label: "Low Angle", hint: "Looks up — subject feels powerful/imposing" },
  { value: "dutch", label: "Dutch Angle", hint: "Tilted horizon — unease, tension" },
  { value: "birds-eye", label: "Bird's Eye", hint: "Straight down — god's-eye, geometry" },
  { value: "worms-eye", label: "Worm's Eye", hint: "Straight up — scale, awe" },
  { value: "over-shoulder", label: "Over Shoulder", hint: "Relationship / conversation" },
];

export const CAMERA_MOVEMENTS: { value: CameraMovement; label: string }[] = [
  { value: "static", label: "Static / Locked" },
  { value: "pan", label: "Pan" },
  { value: "tilt", label: "Tilt" },
  { value: "dolly-in", label: "Dolly In (push)" },
  { value: "dolly-out", label: "Dolly Out (pull)" },
  { value: "tracking", label: "Tracking / Follow" },
  { value: "crane", label: "Crane / Jib" },
  { value: "handheld", label: "Handheld" },
  { value: "zoom", label: "Zoom" },
  { value: "steadicam", label: "Steadicam" },
];

export const LENSES: { value: Lens; label: string; hint: string }[] = [
  { value: "14mm", label: "14mm", hint: "Ultra-wide — dramatic depth, distortion" },
  { value: "24mm", label: "24mm", hint: "Wide — environment & context" },
  { value: "35mm", label: "35mm", hint: "Natural wide — versatile" },
  { value: "50mm", label: "50mm", hint: "Normal — human eye perspective" },
  { value: "85mm", label: "85mm", hint: "Portrait — flattering, compressed" },
  { value: "135mm", label: "135mm", hint: "Telephoto — isolation, strong compression" },
];

export const FACINGS: { value: Facing; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "three-quarter-left", label: "¾ Left" },
  { value: "three-quarter-right", label: "¾ Right" },
];

export const POSES: { value: Pose; label: string }[] = [
  { value: "standing", label: "Standing" },
  { value: "walking", label: "Walking" },
  { value: "sitting", label: "Sitting" },
  { value: "crouching", label: "Crouching" },
  { value: "lying", label: "Lying" },
  { value: "gesturing", label: "Gesturing" },
];

// Palette used for character stage markers (works in dark mode)
export const CHARACTER_COLORS = [
  "#e8776b",
  "#6ba8e8",
  "#8fd18a",
  "#e8c46b",
  "#c48fe8",
  "#6be8d1",
  "#e88fb8",
  "#a0a8b8",
];

export const TIME_OF_DAY = ["DAY", "NIGHT", "DUSK", "DAWN", "MORNING", "AFTERNOON", "CONTINUOUS"];

export function shotTypeLabel(value: ShotType): string {
  return SHOT_TYPES.find((s) => s.value === value)?.label ?? value;
}
export function shotFraming(value: ShotType): number {
  return SHOT_TYPES.find((s) => s.value === value)?.framing ?? 0.5;
}
export function angleLabel(value: CameraAngle): string {
  return CAMERA_ANGLES.find((a) => a.value === value)?.label ?? value;
}
export function movementLabel(value: CameraMovement): string {
  return CAMERA_MOVEMENTS.find((m) => m.value === value)?.label ?? value;
}
