# Sinclaire Storion

**Property of Sinclaire Sebastian Studios — created by Sseruwagi Sinclaire Sebastian.**

A director-first visual planning workspace — *Figma for storyboards*. Built to help
filmmakers **think like directors**, not just arrange boxes on a page. This is the
standalone **desktop application** (Tauri), built with the recommended stack.

## Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | **Tauri 2** (Rust) — small, fast, low-memory native app |
| UI | **React 18** + **TypeScript** |
| Styling | **Tailwind CSS v4** |
| Storyboard canvas | **Konva.js** (`react-konva`) — infinite canvas, zoom, pan, selection |
| Story Flow graph | **React Flow** (`@xyflow/react`) |
| Animation | **Framer Motion** |
| State + persistence | **Zustand** + local storage |
| Build | **Vite** |

## Features

- **Intelligent Storyboard Canvas** — a Konva infinite canvas; panels carry shot #, scene #, camera angle, movement, lens, character positions, dialogue, action, director's notes and estimated duration.
- **Script Import** — paste a screenplay → scenes split from sluglines, characters detected, locations identified, opening shots suggested.
- **Shot Designer + Camera Simulator** — drag characters on a top-down stage; move the camera and its target; one-click WS/MS/CU/ECU/OTS/POV/Dutch/bird's-eye/worm's-eye. The frame regenerates instantly.
- **Character & Location libraries**, reusable across the project.
- **Timeline + Animatic** — drag a clip's edge to retime; press play to preview scene rhythm.
- **Story Flow** — the whole story as a connected node graph, colour-coded by shot size.
- **Composition Assistant** — rule of thirds, headroom, looking room, negative space.
- **Director's Notebook + Mood Board + Collaboration** — per-scene notes, references, and role-tagged frame comments.
- **Production Mode** — auto shot list, actor/prop/equipment checklists, shooting order, CSV export.
- **Story Brain** (flagship) — reads the board like an experienced AD and surfaces coverage, pacing, screen-direction, 180°, and emphasis insights. It never rewrites your vision.

Projects export/import as `.storion.json`; the shot list exports to CSV.

## Develop

```bash
npm install
npm run dev          # web preview at http://localhost:1420
npm run tauri:dev    # run the desktop app (needs the Rust toolchain)
```

## Build a desktop installer

```bash
npm run tauri:build
```

On Windows this produces an `.msi` and an NSIS `.exe` in
`src-tauri/target/release/bundle/`. Building a Windows installer must be done on
Windows (WebView2). Cross-platform installers are produced automatically by the
GitHub Actions workflow (`.github/workflows/release.yml`) — push a tag like
`v0.1.0` and the Windows installer is built on a Windows runner and attached to a
GitHub Release.

### Regenerating icons

```bash
node scripts/gen-icon.mjs           # writes app-icon.png
npx @tauri-apps/cli icon app-icon.png
```

---

© Sinclaire Sebastian Studios. Made by Sseruwagi Sinclaire Sebastian.
