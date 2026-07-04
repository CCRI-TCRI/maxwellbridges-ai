"use client";
// Sinclaire Storion — Director's Notebook + Mood Board + Collaboration
import { Check, ImagePlus, MessageSquare, NotebookPen, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio/store";
import type { MoodImage } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { EmptyState, Field, Select, TextArea, TextInput } from "./ui";

function MoodBoard({ sceneId }: { sceneId: string }) {
  const scene = useStudio((s) => s.project.scenes.find((sc) => sc.id === sceneId));
  const update = useStudio((s) => s.updateScene);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<MoodImage["category"]>("general");
  if (!scene) return null;

  const add = () => {
    if (!url.trim()) return;
    const img: MoodImage = { id: nanoid(8), url: url.trim(), caption: caption.trim(), category };
    update(sceneId, { moodImages: [...scene.moodImages, img] });
    setUrl("");
    setCaption("");
  };
  const remove = (id: string) =>
    update(sceneId, { moodImages: scene.moodImages.filter((m) => m.id !== id) });

  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 font-semibold text-sm">
        <ImagePlus className="size-4" /> Mood Board
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {scene.moodImages.map((m) => (
          <figure className="group relative overflow-hidden rounded-lg border border-border" key={m.id}>
            {/* biome-ignore lint/performance/noImgElement: user-supplied reference URLs */}
            <img alt={m.caption} className="aspect-square w-full object-cover" src={m.url} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[10px] text-white">
              <span className="rounded bg-white/20 px-1 uppercase">{m.category}</span> {m.caption}
            </figcaption>
            <button
              className="absolute top-1 right-1 rounded bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => remove(m.id)}
              type="button"
            >
              <Trash2 className="size-3" />
            </button>
          </figure>
        ))}
        {scene.moodImages.length === 0 && (
          <p className="col-span-full text-muted-foreground text-xs">
            No references yet. Paste an image URL below to start the board.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border border-dashed p-3">
        <Field className="min-w-[180px] flex-1" label="Image URL">
          <TextInput onChange={(e) => setUrl(e.target.value)} placeholder="https://…" value={url} />
        </Field>
        <Field className="min-w-[120px]" label="Caption">
          <TextInput onChange={(e) => setCaption(e.target.value)} value={caption} />
        </Field>
        <Field className="w-32" label="Category">
          <Select
            onChange={(v) => setCategory(v as MoodImage["category"])}
            options={[
              { value: "general", label: "General" },
              { value: "lighting", label: "Lighting" },
              { value: "costume", label: "Costume" },
              { value: "architecture", label: "Architecture" },
              { value: "palette", label: "Palette" },
              { value: "camera", label: "Camera" },
            ]}
            value={category}
          />
        </Field>
        <Button onClick={add} size="sm" variant="outline">
          Add
        </Button>
      </div>
    </div>
  );
}

function SceneComments({ sceneId }: { sceneId: string }) {
  const allPanels = useStudio((s) => s.project.panels);
  const panels = allPanels.filter((p) => p.sceneId === sceneId);
  const comments = useStudio((s) => s.project.comments);
  const panelIds = new Set(panels.map((p) => p.id));
  const sceneComments = comments.filter((c) => panelIds.has(c.panelId));
  const addComment = useStudio((s) => s.addComment);
  const toggle = useStudio((s) => s.toggleCommentResolved);
  const del = useStudio((s) => s.deleteComment);
  const selectPanel = useStudio((s) => s.selectPanel);
  const setView = useStudio((s) => s.setView);

  const [body, setBody] = useState("");
  const [role, setRole] = useState("Director");
  const [target, setTarget] = useState(panels[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 font-semibold text-sm">
        <MessageSquare className="size-4" /> Review & Comments
      </h3>
      <ul className="flex flex-col gap-2">
        {sceneComments.length === 0 && (
          <p className="text-muted-foreground text-xs">No comments on this scene's shots yet.</p>
        )}
        {sceneComments.map((c) => {
          const panel = panels.find((p) => p.id === c.panelId);
          return (
            <li
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2.5",
                c.resolved ? "border-border/50 opacity-60" : "border-border"
              )}
              key={c.id}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">{c.author}</span>
                  <span className="rounded bg-secondary px-1 text-[10px] text-secondary-foreground">{c.role}</span>
                  <button
                    className="font-mono text-[10px] text-sky-400 hover:underline"
                    onClick={() => {
                      selectPanel(c.panelId);
                      setView("board");
                    }}
                    type="button"
                  >
                    {panel?.shotNumber ?? "?"}
                  </button>
                </div>
                <p className={cn("mt-0.5 text-sm", c.resolved && "line-through")}>{c.body}</p>
              </div>
              <button className="rounded p-1 text-muted-foreground hover:text-emerald-400" onClick={() => toggle(c.id)} title="Resolve" type="button">
                <Check className="size-3.5" />
              </button>
              <button className="rounded p-1 text-muted-foreground hover:text-destructive" onClick={() => del(c.id)} type="button">
                <Trash2 className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
      {panels.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border border-dashed p-3">
          <Field className="w-28" label="On shot">
            <Select onChange={setTarget} options={panels.map((p) => ({ value: p.id, label: p.shotNumber }))} value={target || panels[0].id} />
          </Field>
          <Field className="w-32" label="Role">
            <Select
              onChange={setRole}
              options={["Director", "DP / Cinematographer", "Writer", "Producer", "Animator", "Editor"].map((r) => ({ value: r, label: r }))}
              value={role}
            />
          </Field>
          <Field className="min-w-[200px] flex-1" label="Comment">
            <TextInput onChange={(e) => setBody(e.target.value)} placeholder="Leave a note on this frame…" value={body} />
          </Field>
          <Button
            disabled={!body.trim()}
            onClick={() => {
              addComment(target || panels[0].id, body.trim(), "You", role);
              setBody("");
            }}
            size="sm"
            variant="outline"
          >
            Post
          </Button>
        </div>
      )}
    </div>
  );
}

export function NotebookView() {
  const project = useStudio((s) => s.project);
  const selectedSceneId = useStudio((s) => s.selectedSceneId);
  const selectScene = useStudio((s) => s.selectScene);
  const update = useStudio((s) => s.updateScene);

  const scene = project.scenes.find((s) => s.id === selectedSceneId) ?? project.scenes[0];

  if (!scene) {
    return <EmptyState icon={<NotebookPen className="size-10" />} title="No scenes yet" hint="Add a scene to keep director's notes." />;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      {/* scene picker */}
      <div className="flex flex-wrap gap-2">
        {project.scenes.map((sc) => (
          <button
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              sc.id === scene.id ? "border-ring bg-secondary" : "border-border text-muted-foreground hover:border-ring/60"
            )}
            key={sc.id}
            onClick={() => selectScene(sc.id)}
            type="button"
          >
            SC {sc.number} · {sc.location}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Field label="Scene heading">
          <TextInput
            className="font-mono font-semibold"
            onChange={(e) => update(scene.id, { heading: e.target.value.toUpperCase() })}
            value={scene.heading}
          />
        </Field>
        <Field label="Synopsis">
          <TextArea onChange={(e) => update(scene.id, { synopsis: e.target.value })} value={scene.synopsis} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Objective">
          <TextArea onChange={(e) => update(scene.id, { objective: e.target.value })} value={scene.objective} />
        </Field>
        <Field label="Emotional tone (drives Story Brain)">
          <TextArea onChange={(e) => update(scene.id, { emotionalTone: e.target.value })} value={scene.emotionalTone} />
        </Field>
        <Field label="Lighting notes">
          <TextArea onChange={(e) => update(scene.id, { lightingNotes: e.target.value })} value={scene.lightingNotes} />
        </Field>
        <Field label="Music ideas">
          <TextArea onChange={(e) => update(scene.id, { musicIdeas: e.target.value })} value={scene.musicIdeas} />
        </Field>
        <Field label="Costume notes">
          <TextArea onChange={(e) => update(scene.id, { costumeNotes: e.target.value })} value={scene.costumeNotes} />
        </Field>
        <Field label="Prop list (comma-separated)">
          <TextArea
            onChange={(e) => update(scene.id, { propList: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            value={scene.propList.join(", ")}
          />
        </Field>
        <Field className="sm:col-span-2" label="References (comma-separated)">
          <TextInput
            onChange={(e) => update(scene.id, { references: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            value={scene.references.join(", ")}
          />
        </Field>
      </div>

      <MoodBoard sceneId={scene.id} />
      <SceneComments sceneId={scene.id} />
    </div>
  );
}
