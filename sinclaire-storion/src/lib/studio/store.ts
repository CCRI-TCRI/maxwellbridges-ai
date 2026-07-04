// Sinclaire Storion — application store
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  blankCharacter,
  blankLocation,
  blankPanel,
  blankScene,
} from "./factory";
import { buildSampleProject } from "./sample-data";
import { parseScreenplay } from "./script-parser";
import type {
  Character,
  Comment,
  LocationPreset,
  Panel,
  Project,
  Scene,
  StagePosition,
  StudioView,
} from "./types";

interface StudioState {
  project: Project;
  view: StudioView;
  selectedSceneId: string | null;
  selectedPanelId: string | null;
  highlightPanelIds: string[]; // set by Story Brain "reveal"
  compositionOverlay: boolean;

  setView: (v: StudioView) => void;
  selectScene: (id: string | null) => void;
  selectPanel: (id: string | null) => void;
  setHighlight: (ids: string[]) => void;
  toggleComposition: () => void;

  // project
  updateProjectMeta: (patch: Partial<Pick<Project, "title" | "logline">>) => void;
  resetToSample: () => void;
  clearProject: () => void;
  importProject: (p: Project) => void;

  // scenes
  addScene: () => string;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  deleteScene: (id: string) => void;

  // panels
  addPanel: (sceneId: string) => string;
  updatePanel: (id: string, patch: Partial<Panel>) => void;
  duplicatePanel: (id: string) => void;
  deletePanel: (id: string) => void;
  reorderPanel: (id: string, direction: -1 | 1) => void;
  updateStagePosition: (panelId: string, posId: string, patch: Partial<StagePosition>) => void;
  addStagePerson: (panelId: string, characterId: string | null, label: string) => void;
  removeStagePerson: (panelId: string, posId: string) => void;

  // characters & locations
  addCharacter: () => string;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addLocation: () => string;
  updateLocation: (id: string, patch: Partial<LocationPreset>) => void;
  deleteLocation: (id: string) => void;

  // comments
  addComment: (panelId: string, body: string, author: string, role: string) => void;
  toggleCommentResolved: (id: string) => void;
  deleteComment: (id: string) => void;

  // script import
  importScreenplay: (text: string, replace: boolean) => { scenes: number; panels: number; characters: number };
}

const touch = (p: Project): Project => ({ ...p, updatedAt: Date.now() });

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      project: buildSampleProject(),
      view: "board",
      selectedSceneId: null,
      selectedPanelId: null,
      highlightPanelIds: [],
      compositionOverlay: false,

      setView: (v) => set({ view: v }),
      selectScene: (id) => set({ selectedSceneId: id }),
      selectPanel: (id) => set({ selectedPanelId: id }),
      setHighlight: (ids) => set({ highlightPanelIds: ids }),
      toggleComposition: () => set((s) => ({ compositionOverlay: !s.compositionOverlay })),

      updateProjectMeta: (patch) =>
        set((s) => ({ project: touch({ ...s.project, ...patch }) })),
      resetToSample: () =>
        set({ project: buildSampleProject(), selectedPanelId: null, selectedSceneId: null }),
      clearProject: () =>
        set({
          project: touch({
            id: nanoid(10),
            title: "Untitled Project",
            logline: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            scenes: [],
            panels: [],
            characters: [],
            locations: [],
            comments: [],
          }),
          selectedPanelId: null,
          selectedSceneId: null,
        }),
      importProject: (p) => set({ project: touch(p), selectedPanelId: null, selectedSceneId: null }),

      addScene: () => {
        const project = get().project;
        const number = project.scenes.length + 1;
        const scene = blankScene(number);
        set({ project: touch({ ...project, scenes: [...project.scenes, scene] }) });
        return scene.id;
      },
      updateScene: (id, patch) =>
        set((s) => ({
          project: touch({
            ...s.project,
            scenes: s.project.scenes.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
          }),
        })),
      deleteScene: (id) =>
        set((s) => ({
          project: touch({
            ...s.project,
            scenes: s.project.scenes.filter((sc) => sc.id !== id),
            panels: s.project.panels.filter((p) => p.sceneId !== id),
          }),
          selectedSceneId: s.selectedSceneId === id ? null : s.selectedSceneId,
        })),

      addPanel: (sceneId) => {
        const project = get().project;
        const scenePanels = project.panels.filter((p) => p.sceneId === sceneId);
        const scene = project.scenes.find((s) => s.id === sceneId);
        const order = scenePanels.length;
        const shotNumber = `${scene?.number ?? "?"}${String.fromCharCode(65 + order)}`;
        const panel = blankPanel(sceneId, order, shotNumber);
        set({ project: touch({ ...project, panels: [...project.panels, panel] }) });
        return panel.id;
      },
      updatePanel: (id, patch) =>
        set((s) => ({
          project: touch({
            ...s.project,
            panels: s.project.panels.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          }),
        })),
      duplicatePanel: (id) =>
        set((s) => {
          const orig = s.project.panels.find((p) => p.id === id);
          if (!orig) return s;
          const copy: Panel = {
            ...orig,
            id: nanoid(10),
            order: orig.order + 0.5,
            shotNumber: `${orig.shotNumber}′`,
            stage: orig.stage.map((sp) => ({ ...sp, id: nanoid(8) })),
            camera: { ...orig.camera },
          };
          // renormalize orders per scene
          const bySceneOrder: Record<string, number> = {};
          const normalized = [...s.project.panels, copy]
            .sort((a, b) => a.order - b.order)
            .map((p) => {
              bySceneOrder[p.sceneId] = (bySceneOrder[p.sceneId] ?? -1) + 1;
              return { ...p, order: bySceneOrder[p.sceneId] };
            });
          return { project: touch({ ...s.project, panels: normalized }) };
        }),
      deletePanel: (id) =>
        set((s) => ({
          project: touch({
            ...s.project,
            panels: s.project.panels.filter((p) => p.id !== id),
            comments: s.project.comments.filter((c) => c.panelId !== id),
          }),
          selectedPanelId: s.selectedPanelId === id ? null : s.selectedPanelId,
        })),
      reorderPanel: (id, direction) =>
        set((s) => {
          const panel = s.project.panels.find((p) => p.id === id);
          if (!panel) return s;
          const siblings = s.project.panels
            .filter((p) => p.sceneId === panel.sceneId)
            .sort((a, b) => a.order - b.order);
          const idx = siblings.findIndex((p) => p.id === id);
          const swapIdx = idx + direction;
          if (swapIdx < 0 || swapIdx >= siblings.length) return s;
          const a = siblings[idx];
          const b = siblings[swapIdx];
          const panels = s.project.panels.map((p) => {
            if (p.id === a.id) return { ...p, order: b.order };
            if (p.id === b.id) return { ...p, order: a.order };
            return p;
          });
          return { project: touch({ ...s.project, panels }) };
        }),
      updateStagePosition: (panelId, posId, patch) =>
        set((s) => ({
          project: touch({
            ...s.project,
            panels: s.project.panels.map((p) =>
              p.id === panelId
                ? { ...p, stage: p.stage.map((sp) => (sp.id === posId ? { ...sp, ...patch } : sp)) }
                : p
            ),
          }),
        })),
      addStagePerson: (panelId, characterId, label) =>
        set((s) => {
          const character = s.project.characters.find((c) => c.id === characterId);
          const pos: StagePosition = {
            id: nanoid(8),
            characterId,
            label: character?.name ?? label,
            x: 0.5,
            y: 0.55,
            facing: "front",
            pose: "standing",
            scale: 1,
            color: character?.color ?? "#a0a8b8",
            isProp: characterId === null && label.toLowerCase().includes("prop"),
          };
          return {
            project: touch({
              ...s.project,
              panels: s.project.panels.map((p) =>
                p.id === panelId ? { ...p, stage: [...p.stage, pos] } : p
              ),
            }),
          };
        }),
      removeStagePerson: (panelId, posId) =>
        set((s) => ({
          project: touch({
            ...s.project,
            panels: s.project.panels.map((p) =>
              p.id === panelId ? { ...p, stage: p.stage.filter((sp) => sp.id !== posId) } : p
            ),
          }),
        })),

      addCharacter: () => {
        const project = get().project;
        const colors = ["#e8776b", "#6ba8e8", "#8fd18a", "#e8c46b", "#c48fe8", "#6be8d1"];
        const ch = blankCharacter("New Character", colors[project.characters.length % colors.length]);
        set({ project: touch({ ...project, characters: [...project.characters, ch] }) });
        return ch.id;
      },
      updateCharacter: (id, patch) =>
        set((s) => ({
          project: touch({
            ...s.project,
            characters: s.project.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          }),
        })),
      deleteCharacter: (id) =>
        set((s) => ({
          project: touch({
            ...s.project,
            characters: s.project.characters.filter((c) => c.id !== id),
          }),
        })),
      addLocation: () => {
        const project = get().project;
        const loc = blankLocation();
        set({ project: touch({ ...project, locations: [...project.locations, loc] }) });
        return loc.id;
      },
      updateLocation: (id, patch) =>
        set((s) => ({
          project: touch({
            ...s.project,
            locations: s.project.locations.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          }),
        })),
      deleteLocation: (id) =>
        set((s) => ({
          project: touch({
            ...s.project,
            locations: s.project.locations.filter((l) => l.id !== id),
          }),
        })),

      addComment: (panelId, body, author, role) =>
        set((s) => {
          const comment: Comment = {
            id: nanoid(10),
            panelId,
            author: author || "Anonymous",
            role: role || "Reviewer",
            body,
            createdAt: Date.now(),
            resolved: false,
          };
          return { project: touch({ ...s.project, comments: [...s.project.comments, comment] }) };
        }),
      toggleCommentResolved: (id) =>
        set((s) => ({
          project: touch({
            ...s.project,
            comments: s.project.comments.map((c) =>
              c.id === id ? { ...c, resolved: !c.resolved } : c
            ),
          }),
        })),
      deleteComment: (id) =>
        set((s) => ({
          project: touch({
            ...s.project,
            comments: s.project.comments.filter((c) => c.id !== id),
          }),
        })),

      importScreenplay: (text, replace) => {
        const parsed = parseScreenplay(text);
        set((s) => {
          const base = replace ? { scenes: [], panels: [], characters: [] } : s.project;
          // merge characters by name
          const existingNames = new Set(base.characters.map((c) => c.name.toUpperCase()));
          const newChars = parsed.characters.filter((c) => !existingNames.has(c.name.toUpperCase()));
          return {
            project: touch({
              ...s.project,
              scenes: [...base.scenes, ...parsed.scenes],
              panels: [...base.panels, ...parsed.panels],
              characters: [...base.characters, ...newChars],
            }),
            selectedSceneId: parsed.scenes[0]?.id ?? s.selectedSceneId,
          };
        });
        return {
          scenes: parsed.scenes.length,
          panels: parsed.panels.length,
          characters: parsed.characters.length,
        };
      },
    }),
    {
      name: "sinclaire-storion:v1",
      partialize: (s) => ({ project: s.project }),
    }
  )
);
