"use client";
// Sinclaire Storion — Script Import
import { FileText, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SAMPLE_SCREENPLAY } from "@/lib/studio/sample-data";
import { useStudio } from "@/lib/studio/store";

export function ScriptImportView() {
  const importScreenplay = useStudio((s) => s.importScreenplay);
  const setView = useStudio((s) => s.setView);
  const [text, setText] = useState("");
  const [replace, setReplace] = useState(false);

  const run = () => {
    if (!text.trim()) {
      toast.error("Paste a screenplay first.");
      return;
    }
    const result = importScreenplay(text, replace);
    toast.success(
      `Imported ${result.scenes} scene${result.scenes === 1 ? "" : "s"}, ${result.panels} suggested shots, ${result.characters} characters.`
    );
    setText("");
    setView("board");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-secondary p-2">
          <FileText className="size-6" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Script Import</h2>
          <p className="text-muted-foreground text-sm">
            Paste a screenplay. Storion splits scenes from sluglines (INT./EXT.), detects characters
            from dialogue cues, identifies locations, and suggests an opening set of shots for each scene.
          </p>
        </div>
      </div>

      <textarea
        className="min-h-[320px] w-full resize-y rounded-lg border border-border bg-background/60 p-3 font-mono text-sm leading-relaxed outline-none focus:border-ring"
        onChange={(e) => setText(e.target.value)}
        placeholder={"INT. COFFEE SHOP - DAY\n\nMAYA sits alone by the window, stirring a cold coffee.\n\nMAYA\nHe's not coming.\n\n…"}
        value={text}
        spellCheck={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-muted-foreground text-sm">
          <input checked={replace} onChange={(e) => setReplace(e.target.checked)} type="checkbox" />
          Replace current scenes & shots (otherwise append)
        </label>
        <div className="flex gap-2">
          <Button onClick={() => setText(SAMPLE_SCREENPLAY)} size="sm" variant="ghost">
            Load sample
          </Button>
          <Button onClick={run} variant="default">
            <Wand2 className="size-4" /> Parse & Build Storyboard
          </Button>
        </div>
      </div>
    </div>
  );
}
