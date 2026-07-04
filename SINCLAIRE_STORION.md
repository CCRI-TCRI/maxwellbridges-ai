# Sinclaire Storion

**Property of Sinclaire Sebastian Studios — created by Sseruwagi Sinclaire Sebastian.**

Sinclaire Storion is a director-first visual planning workspace. Most storyboard
software is either too basic or too focused on drawing. Storion is built to help
filmmakers **think like directors** — not just arrange boxes on a page. It is the
central workspace where writers, directors, cinematographers, and animators plan
every shot before production begins: *Figma for storyboards.*

> Open the app at **`/studio`**.

---

## What's implemented

The app runs entirely in the browser and **persists your project to local storage**
(no login, no database setup required). It ships with a sample project — *"The Weight
of Rain"* — so every feature has something to work with immediately.

| # | Feature | Where |
|---|---------|-------|
| 1 | **Intelligent Storyboard Canvas** — panels carry shot #, scene #, camera angle, movement, lens, character positions, dialogue, action, director's notes and estimated duration | Board |
| 2 | **Script Import** — paste a screenplay; Storion splits scenes from sluglines, detects characters from dialogue cues, identifies locations and suggests an opening set of shots | Script Import |
| 3 | **Shot Designer** — a top-down stage where you drag characters, set facing/pose, and place the camera; the storyboard frame regenerates instantly | Shot Designer |
| 4 | **Camera Simulator** — one-click WS / MS / CU / ECU / OTS / POV / Dutch / bird's-eye / worm's-eye; the frame reframes in real time | Shot Designer / Inspector |
| 5 | **Character Library** — reusable characters (height, clothing, colours, hair, accessories) | Library |
| 6 | **Location Library** — reusable sets with palettes and ambient-light notes | Library |
| 8 | **Timeline & Animatic** — every panel on a timeline; drag a clip's edge to retime; press play to preview the scene's rhythm | Timeline |
| 9 | **Composition Assistant** — rule of thirds, headroom, looking room, negative space, with explanations | Inspector |
| 10 | **Director's Notebook** — per-scene objective, emotional tone, music, lighting, costume, props, references | Notebook |
| 11 | **Collaboration** — leave role-tagged comments (Director, DP, Writer…) on individual frames; resolve them | Notebook / Board |
| 12 | **Production Mode** — auto-generated shot list, actor list, prop & equipment checklists, location-grouped shooting order; CSV export | Production |
| 13 | **Mood Board** — attach reference images per scene, categorised (lighting, costume, palette, camera…) | Notebook |
| 14 | **Story Flow** — the whole story as a connected node graph, colour-coded by shot size, to spot pacing and repetition at a glance | Story Flow |
| ★ | **Story Brain** — the flagship. Reads the board like an experienced AD and surfaces insights: repeated shot sizes, missing coverage, screen-direction breaks, 180° line crossings, uniform pacing, emotional peaks that could push in, and more. It never rewrites your vision. | Story Brain |

Projects export/import as `.storion.json`, and the shot list exports to CSV.

---

## Tech stack

Built on a React 19 / Next.js 16 / TypeScript / Tailwind CSS v4 foundation with
Framer Motion, shadcn/ui, and React Flow (`@xyflow/react`) for the Story Flow graph.
State is a single Zustand store with `persist` to local storage. The cinematic shot
frames are rendered as deterministic SVG (shot type, camera angle, target and staging
drive the framing) — fast, crisp at any zoom, and export-friendly.

- **UI:** React + TypeScript + Tailwind CSS + Framer Motion
- **Storyboard graph:** React Flow
- **State / persistence:** Zustand + localStorage
- **Screenplay parsing, Story Brain, composition analysis:** pure TypeScript (`lib/studio/`)

### Roadmap / future
The recommended desktop packaging (**Tauri**) and cloud sync (**Supabase / SQLite**)
are natural next steps — the domain model in `lib/studio/types.ts` is storage-agnostic,
so wrapping the current web build in Tauri or syncing the project object to a backend
does not require rearchitecting the app. Future export targets: PDF / PNG contact
sheets, Final Cut XML, and Premiere markers.

---

## Running locally

```bash
pnpm install
pnpm dev
# open http://localhost:3000/studio
```

The `/studio` route needs no authentication or database — it is a self-contained,
client-side workspace.

## Project layout

```
lib/studio/
├── types.ts          Domain model (Project, Scene, Panel, Character, Location…)
├── constants.ts      Cinematic vocabulary (shot types, angles, movements, lenses)
├── factory.ts        Object factories
├── script-parser.ts  Screenplay → scenes / characters / suggested shots
├── story-brain.ts    Filmmaking insight engine
├── composition.ts    Per-panel composition checks
├── sample-data.ts    "The Weight of Rain" demo project
└── store.ts          Zustand store (all mutations + persistence)

components/studio/
├── studio-shell.tsx      App shell (top bar, nav rail, inspector)
├── shot-frame.tsx        SVG cinematic frame renderer
├── board-view.tsx        Intelligent Storyboard Canvas
├── panel-card.tsx        Storyboard panel
├── inspector.tsx         Shot inspector + composition assistant
├── shot-designer.tsx     Shot Designer + Camera Simulator
├── timeline-view.tsx     Timeline + animatic preview
├── story-flow-view.tsx   Story Flow graph
├── story-brain-view.tsx  Story Brain
├── library-view.tsx      Character & Location libraries
├── notebook-view.tsx     Director's Notebook + Mood Board + comments
├── production-view.tsx   Production Mode
└── script-import-view.tsx Script Import
```

---

© Sinclaire Sebastian Studios. Sinclaire Storion and the Storion name are the
property of Sinclaire Sebastian Studios. Made by Sseruwagi Sinclaire Sebastian.
