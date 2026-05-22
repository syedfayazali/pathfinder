import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: string; message: string; type: "error" | "success" };

const ToastContext = createContext<{
  toast: (message: string, type?: "error" | "success") => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "error" | "success" = "error") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg",
              t.type === "error"
                ? "border-red-500/50 bg-red-950/90 text-red-100"
                : "border-emerald-500/50 bg-emerald-950/90 text-emerald-100",
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((x) => x.filter((i) => i.id !== t.id))}
              className="opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
