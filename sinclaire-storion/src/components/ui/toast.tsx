import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Toast = { id: number; kind: "success" | "error"; message: string };
let counter = 0;
const listeners = new Set<(t: Toast) => void>();

function emit(kind: Toast["kind"], message: string) {
  const t = { id: ++counter, kind, message };
  for (const l of listeners) l(t);
}

export const toast = {
  success: (m: string) => emit("success", m),
  error: (m: string) => emit("error", m),
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const add = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg"
          >
            {t.kind === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-400" />
            ) : (
              <XCircle className="size-4 text-destructive" />
            )}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
