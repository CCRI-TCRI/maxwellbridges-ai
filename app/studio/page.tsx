"use client";
// Sinclaire Storion — entry route
// Property of Sinclaire Sebastian Studios. Made by Sseruwagi Sinclaire Sebastian.
import dynamic from "next/dynamic";

const StudioShell = dynamic(
  () => import("@/components/studio/studio-shell").then((m) => m.StudioShell),
  {
    ssr: false,
    loading: () => (
      <div className="dark flex h-dvh items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm">Loading Sinclaire Storion…</p>
        </div>
      </div>
    ),
  }
);

export default function StudioPage() {
  return <StudioShell />;
}
