// Sinclaire Storion — Production Mode (bridges pre-production & production)
import { Download, ListChecks } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { movementLabel, shotTypeLabel } from "@/lib/studio/constants";
import { useStudio } from "@/lib/studio/store";

function download(filename: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProductionView() {
  const project = useStudio((s) => s.project);

  const rows = useMemo(
    () => project.scenes.flatMap((scene) => project.panels.filter((p) => p.sceneId === scene.id).sort((a, b) => a.order - b.order).map((p) => ({
      scene: scene.number, heading: scene.heading, shot: p.shotNumber, type: shotTypeLabel(p.shotType), angle: p.angle, movement: movementLabel(p.movement), lens: p.lens, duration: p.duration, cast: p.stage.filter((s) => !s.isProp).map((s) => s.label).join(" / "), action: p.action.replace(/\n/g, " "),
    }))),
    [project]
  );

  const cast = useMemo(() => { const set = new Set<string>(); for (const p of project.panels) for (const s of p.stage) if (!s.isProp) set.add(s.label); return Array.from(set); }, [project]);
  const props = useMemo(() => { const set = new Set<string>(); for (const sc of project.scenes) for (const pr of sc.propList) set.add(pr); for (const p of project.panels) for (const s of p.stage) if (s.isProp) set.add(s.label); return Array.from(set); }, [project]);
  const equipment = useMemo(() => {
    const lenses = new Set<string>(); const movements = new Set<string>();
    for (const p of project.panels) {
      lenses.add(p.lens);
      if (p.movement === "crane") movements.add("Crane / Jib arm");
      if (p.movement === "dolly-in" || p.movement === "dolly-out" || p.movement === "tracking") movements.add("Dolly + track");
      if (p.movement === "steadicam") movements.add("Steadicam rig");
      if (p.movement === "handheld") movements.add("Handheld rig / shoulder mount");
    }
    const list = ["Camera body + media", "Tripod / fluid head", ...Array.from(movements)];
    list.push(`Lens kit: ${Array.from(lenses).sort().join(", ")}`);
    return list;
  }, [project]);

  const shootingOrder = useMemo(() => {
    const byLoc = new Map<string, number[]>();
    for (const sc of project.scenes) { const arr = byLoc.get(sc.location) ?? []; arr.push(sc.number); byLoc.set(sc.location, arr); }
    return Array.from(byLoc.entries());
  }, [project]);

  const exportShotList = () => {
    const header = ["Scene", "Heading", "Shot", "Type", "Angle", "Movement", "Lens", "Duration(s)", "Cast", "Action"];
    const csv = [header.join(","), ...rows.map((r) => [r.scene, r.heading, r.shot, r.type, r.angle, r.movement, r.lens, r.duration, r.cast, r.action].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    download(`${project.title.replace(/\s+/g, "_")}_shotlist.csv`, csv);
  };

  const totalRuntime = rows.reduce((a, r) => a + r.duration, 0);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-lg"><ListChecks className="size-5" /> Production Mode</h2>
          <p className="text-muted-foreground text-sm">{rows.length} shots · {project.scenes.length} scenes · est. {Math.round(totalRuntime)}s runtime</p>
        </div>
        <Button onClick={exportShotList} variant="outline"><Download className="size-4" /> Export Shot List (CSV)</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground uppercase">
            <tr>{["Sc", "Shot", "Type", "Angle", "Move", "Lens", "Dur", "Cast", "Action"].map((h) => (<th className="whitespace-nowrap px-2.5 py-2 font-medium" key={h}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr className="border-border/50 border-t hover:bg-secondary/30" key={`${r.shot}-${i}`}>
                <td className="px-2.5 py-1.5 font-mono">{r.scene}</td>
                <td className="px-2.5 py-1.5 font-mono font-semibold">{r.shot}</td>
                <td className="whitespace-nowrap px-2.5 py-1.5">{r.type}</td>
                <td className="px-2.5 py-1.5">{r.angle}</td>
                <td className="whitespace-nowrap px-2.5 py-1.5">{r.movement}</td>
                <td className="px-2.5 py-1.5">{r.lens}</td>
                <td className="px-2.5 py-1.5 font-mono">{r.duration}s</td>
                <td className="whitespace-nowrap px-2.5 py-1.5">{r.cast || "—"}</td>
                <td className="max-w-[280px] truncate px-2.5 py-1.5 text-muted-foreground">{r.action || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ChecklistCard items={cast} title="Actor List" />
        <ChecklistCard items={props} title="Prop Checklist" />
        <ChecklistCard items={equipment} title="Equipment Checklist" />
        <div className="rounded-lg border border-border p-3">
          <h3 className="mb-2 font-semibold text-sm">Shooting Order</h3>
          <p className="mb-2 text-[11px] text-muted-foreground">Grouped by location to minimize company moves.</p>
          <ol className="flex flex-col gap-1.5 text-xs">
            {shootingOrder.map(([loc, scenes], i) => (
              <li className="flex gap-2" key={loc}><span className="font-mono text-muted-foreground">{i + 1}.</span><span><span className="font-medium">{loc}</span><span className="text-muted-foreground"> — scenes {scenes.join(", ")}</span></span></li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <h3 className="mb-2 font-semibold text-sm">{title}</h3>
      {items.length === 0 ? <p className="text-muted-foreground text-xs">None recorded.</p> : (
        <ul className="flex flex-col gap-1 text-xs">{items.map((it) => (<li className="flex items-center gap-2" key={it}><span className="size-3 shrink-0 rounded-sm border border-border" />{it}</li>))}</ul>
      )}
    </div>
  );
}
