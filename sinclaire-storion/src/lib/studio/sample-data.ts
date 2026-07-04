// Sinclaire Storion — sample project ("The Weight of Rain")
import { nanoid } from "nanoid";
import { blankCamera } from "./factory";
import type { Character, LocationPreset, Panel, Project, Scene, StagePosition } from "./types";

function person(
  characterId: string,
  label: string,
  x: number,
  facing: StagePosition["facing"],
  color: string
): StagePosition {
  return {
    id: nanoid(8),
    characterId,
    label,
    x,
    y: 0.55,
    facing,
    pose: "standing",
    scale: 1,
    color,
  };
}

export function buildSampleProject(): Project {
  const johnId = nanoid(10);
  const elariId = nanoid(10);

  const characters: Character[] = [
    {
      id: johnId,
      name: "JOHN",
      color: "#6ba8e8",
      height: "6'1\"",
      clothing: "Soaked grey overcoat, dark trousers",
      hairstyle: "Short, rain-flattened",
      accessories: "Wedding ring, pocket watch",
      expressionDefault: "haunted",
      notes: "Grieving widower searching for meaning.",
    },
    {
      id: elariId,
      name: "ELARI",
      color: "#e8776b",
      height: "5'6\"",
      clothing: "White linen dress, no coat",
      hairstyle: "Long, unnervingly dry",
      accessories: "Single candle",
      expressionDefault: "serene",
      notes: "The figure who should not be here.",
    },
  ];

  const locations: LocationPreset[] = [
    {
      id: nanoid(10),
      name: "Abandoned Church",
      type: "Interior — Sacred / Ruined",
      description: "Collapsed roof, broken pews, rain falling through the nave.",
      palette: ["#1c1f26", "#2f3646", "#6b7688", "#c9b58a"],
      ambientLight: "Cold moonlight through broken stained glass",
    },
    {
      id: nanoid(10),
      name: "Church Steps — Exterior",
      type: "Exterior — Night",
      description: "Stone steps, heavy rain, single failing streetlamp.",
      palette: ["#0f1218", "#232a38", "#4a5568"],
      ambientLight: "Sodium streetlamp, rain haze",
    },
  ];

  const s1: Scene = {
    id: nanoid(10),
    number: 1,
    heading: "EXT. ABANDONED CHURCH - NIGHT",
    location: "ABANDONED CHURCH",
    timeOfDay: "NIGHT",
    interiorExterior: "EXT",
    synopsis: "John approaches the abandoned church as rain pours down.",
    objective: "Establish John's isolation and the dread of the place.",
    emotionalTone: "Foreboding, lonely",
    musicIdeas: "Low sustained cello, rain foley forward in the mix",
    lightingNotes: "Single hard backlight through the doorway; everything else cold.",
    costumeNotes: "John fully soaked — costume should read heavy and clinging.",
    propList: ["Umbrella (broken)", "Streetlamp", "Church doors"],
    references: ["Se7en (rain palette)", "The Road (isolation)"],
    moodImages: [],
  };

  const s2: Scene = {
    id: nanoid(10),
    number: 2,
    heading: "INT. ABANDONED CHURCH - NIGHT",
    location: "ABANDONED CHURCH",
    timeOfDay: "NIGHT",
    interiorExterior: "INT",
    synopsis: "Inside, John finds Elari waiting by candlelight. They speak.",
    objective: "The impossible reunion — reveal Elari and hold the tension.",
    emotionalTone: "Reveal, confront",
    musicIdeas: "Silence, then a single held note as she turns.",
    lightingNotes: "Candle as sole practical key on Elari; John in cold spill.",
    costumeNotes: "Elari's dress must stay impossibly dry.",
    propList: ["Candle", "Broken pews", "Fallen crucifix"],
    references: ["Andrei Rublev (interior scale)"],
    moodImages: [],
  };

  const scenes = [s1, s2];

  const panels: Panel[] = [
    // Scene 1 — establishing
    {
      id: nanoid(10),
      sceneId: s1.id,
      shotNumber: "1A",
      order: 0,
      shotType: "EWS",
      angle: "high",
      movement: "crane",
      lens: "24mm",
      dialogue: "",
      action: "The church looms. A small figure — John — crosses the empty square toward it.",
      notes: "Crane down from the spire to find John. Establish scale & isolation.",
      duration: 6,
      stage: [person(johnId, "JOHN", 0.35, "right", "#6ba8e8")],
      camera: { ...blankCamera("EWS"), x: 0.5, y: 0.02, targetX: 0.35, targetY: 0.6, angle: "high" },
    },
    {
      id: nanoid(10),
      sceneId: s1.id,
      shotNumber: "1B",
      order: 1,
      shotType: "MS",
      angle: "eye-level",
      movement: "tracking",
      lens: "35mm",
      dialogue: "",
      action: "Tracking with John as rain hammers his shoulders. He does not slow.",
      notes: "Steadicam behind-left. Keep him screen-left, moving right toward the doors.",
      duration: 4,
      stage: [person(johnId, "JOHN", 0.4, "right", "#6ba8e8")],
      camera: { ...blankCamera("MS"), x: 0.25, y: 0.15, targetX: 0.5, targetY: 0.55 },
    },
    {
      id: nanoid(10),
      sceneId: s1.id,
      shotNumber: "1C",
      order: 2,
      shotType: "CU",
      angle: "low",
      movement: "dolly-in",
      lens: "85mm",
      dialogue: "JOHN (V.O.)\nShe said she'd wait.",
      action: "Push in on John's face. Rain, exhaustion, a flicker of hope.",
      notes: "Slow push. Land on the eyes as the VO finishes.",
      duration: 3.5,
      stage: [person(johnId, "JOHN", 0.5, "front", "#6ba8e8")],
      camera: { ...blankCamera("CU"), x: 0.5, y: 0.2, targetX: 0.5, targetY: 0.45, angle: "low" },
    },
    // Scene 2 — interior reveal (contains an intentional screen-direction issue for Story Brain)
    {
      id: nanoid(10),
      sceneId: s2.id,
      shotNumber: "2A",
      order: 0,
      shotType: "WS",
      angle: "eye-level",
      movement: "static",
      lens: "24mm",
      dialogue: "",
      action: "The nave. A single candle burns at the far altar. John enters frame-left.",
      notes: "Locked wide. Let the emptiness breathe before he steps in.",
      duration: 5,
      stage: [
        person(johnId, "JOHN", 0.2, "right", "#6ba8e8"),
        person(elariId, "ELARI", 0.75, "left", "#e8776b"),
      ],
      camera: { ...blankCamera("WS"), x: 0.5, y: 0.1, targetX: 0.5, targetY: 0.55 },
    },
    {
      id: nanoid(10),
      sceneId: s2.id,
      shotNumber: "2B",
      order: 1,
      shotType: "OTS",
      angle: "eye-level",
      movement: "static",
      lens: "50mm",
      dialogue: "JOHN\nElari?",
      action: "Over John's shoulder onto Elari at the altar. She doesn't turn.",
      notes: "Clean OTS. Keep John's shoulder soft-focus frame-right.",
      duration: 3,
      stage: [
        person(johnId, "JOHN", 0.3, "right", "#6ba8e8"),
        person(elariId, "ELARI", 0.7, "left", "#e8776b"),
      ],
      camera: { ...blankCamera("OTS"), x: 0.2, y: 0.35, targetX: 0.7, targetY: 0.55 },
    },
    {
      id: nanoid(10),
      sceneId: s2.id,
      shotNumber: "2C",
      order: 2,
      shotType: "OTS",
      angle: "eye-level",
      movement: "static",
      lens: "50mm",
      // Screen-direction break: John now facing LEFT after facing RIGHT — Story Brain should flag.
      dialogue: "ELARI\nYou're late, my love.",
      action: "Reverse onto John. His face breaks.",
      notes: "Reverse OTS over Elari.",
      duration: 3,
      stage: [
        person(elariId, "ELARI", 0.3, "right", "#e8776b"),
        person(johnId, "JOHN", 0.7, "left", "#6ba8e8"),
      ],
      // Camera crosses to the opposite side — triggers 180° check too.
      camera: { ...blankCamera("OTS"), x: 0.85, y: 0.35, targetX: 0.3, targetY: 0.55 },
    },
    {
      id: nanoid(10),
      sceneId: s2.id,
      shotNumber: "2D",
      order: 3,
      shotType: "MS",
      angle: "eye-level",
      movement: "static",
      lens: "50mm",
      dialogue: "",
      action: "They stand apart in the ruined nave.",
      notes: "Two-shot to reset geography.",
      duration: 3,
      stage: [
        person(johnId, "JOHN", 0.35, "right", "#6ba8e8"),
        person(elariId, "ELARI", 0.65, "left", "#e8776b"),
      ],
      camera: { ...blankCamera("MS"), x: 0.5, y: 0.2, targetX: 0.5, targetY: 0.55 },
    },
  ];

  return {
    id: nanoid(10),
    title: "The Weight of Rain",
    logline:
      "A grieving man follows an impossible promise into an abandoned church, and finds the wife he buried waiting by candlelight.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    scenes,
    panels,
    characters,
    locations,
    comments: [
      {
        id: nanoid(10),
        panelId: panels[2].id,
        author: "S. Sebastian",
        role: "Director",
        body: "Land the push-in exactly on 'wait.' Don't rush the eyes.",
        createdAt: Date.now(),
        resolved: false,
      },
    ],
  };
}

export const SAMPLE_SCREENPLAY = `INT. ABANDONED CHURCH - NIGHT

Rain hammers the broken roof. JOHN steps through the shattered doors, soaked to the bone. A single candle burns at the far altar.

JOHN
Elari?

At the altar, ELARI turns. Her dress is impossibly dry.

ELARI
You're late, my love.

John cannot move. The candle gutters between them.

JOHN
You were buried. I carried the coffin.

ELARI
And yet here I am. Come closer.

EXT. CHURCH STEPS - NIGHT

Lightning. For one white instant the church is empty — no candle, no Elari. Then darkness swallows it again.`;
