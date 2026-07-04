// Sinclaire Storion — Character & Location libraries
import { MapPin, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHARACTER_COLORS } from "@/lib/studio/constants";
import { useStudio } from "@/lib/studio/store";
import { Field, TextArea, TextInput } from "./ui";

function CharacterLibrary() {
  const characters = useStudio((s) => s.project.characters);
  const add = useStudio((s) => s.addCharacter);
  const update = useStudio((s) => s.updateCharacter);
  const del = useStudio((s) => s.deleteCharacter);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-sm"><User className="size-4" /> Characters</h2>
        <Button onClick={add} size="sm" variant="outline"><Plus className="size-4" /> New</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {characters.map((c) => (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3" key={c.id}>
            <div className="flex items-center gap-2">
              <span className="size-5 shrink-0 rounded-full ring-2 ring-border" style={{ background: c.color }} />
              <TextInput className="flex-1 font-semibold" onChange={(e) => update(c.id, { name: e.target.value.toUpperCase() })} value={c.name} />
              <button className="rounded p-1 text-muted-foreground hover:text-destructive" onClick={() => del(c.id)} type="button"><Trash2 className="size-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {CHARACTER_COLORS.map((col) => (
                <button className="size-4 rounded-full ring-1 ring-border transition-transform hover:scale-110" key={col} onClick={() => update(c.id, { color: col })} style={{ background: col, outline: c.color === col ? "2px solid var(--ring)" : "none" }} type="button" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Height"><TextInput onChange={(e) => update(c.id, { height: e.target.value })} value={c.height} /></Field>
              <Field label="Hairstyle"><TextInput onChange={(e) => update(c.id, { hairstyle: e.target.value })} value={c.hairstyle} /></Field>
            </div>
            <Field label="Clothing"><TextInput onChange={(e) => update(c.id, { clothing: e.target.value })} value={c.clothing} /></Field>
            <Field label="Accessories"><TextInput onChange={(e) => update(c.id, { accessories: e.target.value })} value={c.accessories} /></Field>
            <Field label="Notes"><TextArea onChange={(e) => update(c.id, { notes: e.target.value })} value={c.notes} /></Field>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationLibrary() {
  const locations = useStudio((s) => s.project.locations);
  const add = useStudio((s) => s.addLocation);
  const update = useStudio((s) => s.updateLocation);
  const del = useStudio((s) => s.deleteLocation);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-sm"><MapPin className="size-4" /> Locations</h2>
        <Button onClick={add} size="sm" variant="outline"><Plus className="size-4" /> New</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {locations.map((l) => (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3" key={l.id}>
            <div className="flex items-center gap-2">
              <TextInput className="flex-1 font-semibold" onChange={(e) => update(l.id, { name: e.target.value })} value={l.name} />
              <button className="rounded p-1 text-muted-foreground hover:text-destructive" onClick={() => del(l.id)} type="button"><Trash2 className="size-4" /></button>
            </div>
            <div className="flex h-6 overflow-hidden rounded">{l.palette.map((hex, i) => (<div className="flex-1" key={i} style={{ background: hex }} title={hex} />))}</div>
            <Field label="Type"><TextInput onChange={(e) => update(l.id, { type: e.target.value })} value={l.type} /></Field>
            <Field label="Ambient light"><TextInput onChange={(e) => update(l.id, { ambientLight: e.target.value })} value={l.ambientLight} /></Field>
            <Field label="Palette (comma-separated hex)"><TextInput onChange={(e) => update(l.id, { palette: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} value={l.palette.join(", ")} /></Field>
            <Field label="Description"><TextArea onChange={(e) => update(l.id, { description: e.target.value })} value={l.description} /></Field>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LibraryView() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 p-6">
      <CharacterLibrary />
      <LocationLibrary />
    </div>
  );
}
