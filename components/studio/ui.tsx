"use client";
// Sinclaire Storion — shared inspector/form primitives
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-ring focus:bg-background";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={cn(controlClass, "min-h-[64px] resize-y leading-snug", props.className)} />
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      className={cn(controlClass, "cursor-pointer appearance-none", className)}
      onChange={(e) => onChange(e.target.value)}
      value={value}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-border/60 border-b px-4 py-2.5">
      <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
        {children}
      </h3>
      {right}
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "warn" | "muted";
  className?: string;
}) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    accent: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25",
    warn: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono font-medium text-[10px] uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
      {icon && <div className="text-muted-foreground/40">{icon}</div>}
      <p className="font-medium text-muted-foreground text-sm">{title}</p>
      {hint && <p className="max-w-sm text-muted-foreground/70 text-xs">{hint}</p>}
    </div>
  );
}
