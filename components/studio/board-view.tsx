"use client";
// Sinclaire Storion — Intelligent Storyboard Canvas (board of scenes & panels)
import { Clapperboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio/store";
import { EmptyState } from "./ui";
import { PanelCard } from "./panel-card";

export function BoardView() {
  const project = useStudio((s) => s.project);
  const selectedSceneId = useStudio((s) => s.selectedSceneId);
  const addPanel = useStudio((s) => s.addPanel);
  const selectPanel = useStudio((s) => s.selectPanel);
  const addScene = useStudio((s) => s.addScene);
  const selectScene = useStudio((s) => s.selectScene);

  const scenes = selectedSceneId
    ? project.scenes.filter((s) => s.id === selectedSceneId)
    : project.scenes;

  if (project.scenes.length === 0) {
    return (
      <EmptyState
        icon={<Clapperboard className="size-10" />}
        title="No scenes yet"
        hint="Import a screenplay or add a scene to start building your board."
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 p-6">
      {scenes.map((scene) => {
        const panels = project.panels
          .filter((p) => p.sceneId === scene.id)
          .sort((a, b) => a.order - b.order);
        const runtime = panels.reduce((a, p) => a + p.duration, 0);
        return (
          <section key={scene.id} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4 border-border/60 border-b pb-2">
              <div className="flex items-baseline gap-3">
                <span className="rounded bg-primary px-2 py-0.5 font-mono font-bold text-primary-foreground text-sm">
                  SC {scene.number}
                </span>
                <button
                  className="text-left font-semibold text-base hover:underline"
                  onClick={() => {
                    selectScene(scene.id);
                    useStudio.getState().setView("notebook");
                  }}
                  type="button"
                >
                  {scene.heading}
                </button>
                <span className="text-muted-foreground text-xs">
                  {panels.length} shots · {Math.round(runtime)}s
                </span>
              </div>
              <Button
                onClick={() => {
                  const id = addPanel(scene.id);
                  selectPanel(id);
                }}
                size="sm"
                variant="outline"
              >
                <Plus className="size-4" /> Shot
              </Button>
            </div>
            {panels.length === 0 ? (
              <p className="px-1 py-4 text-muted-foreground text-sm">
                No shots in this scene yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {panels.map((panel) => (
                  <PanelCard key={panel.id} panel={panel} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="flex justify-center pt-2">
        <Button onClick={() => selectScene(addScene())} variant="outline">
          <Plus className="size-4" /> Add Scene
        </Button>
      </div>
    </div>
  );
}
