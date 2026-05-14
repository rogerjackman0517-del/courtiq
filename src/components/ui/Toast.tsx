"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
  leaving?: boolean;
};

type Ctx = {
  toast: (message: string, kind?: ToastKind) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (ctx) return ctx;
  // Safe no-op so consumers never crash when the provider isn't mounted
  // (e.g. server render or unit test).
  return {
    toast: (message: string) => {
      if (typeof window !== "undefined" && window.console) {
        console.log("[toast fallback]", message);
      }
    },
  };
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 240);
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove]
  );

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => {
          const Icon =
            t.kind === "success" ? Check : t.kind === "error" ? AlertCircle : Info;
          const tint =
            t.kind === "success"
              ? "border-[#34D399]/30 text-[#34D399]"
              : t.kind === "error"
              ? "border-[#F87171]/30 text-[#F87171]"
              : "border-[#5B8DEF]/30 text-[#5B8DEF]";
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl border ${tint} bg-[#13131C] px-4 py-3 shadow-2xl min-w-[260px] max-w-sm ${t.leaving ? "toast-leave" : "toast-enter"}`}
              role="status"
            >
              <Icon size={16} />
              <p className="flex-1 text-sm text-[#F5F5F7]">{t.message}</p>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-[#6E6E76] hover:text-[#F5F5F7] no-jiggle"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

/** Helper: copy text to clipboard and toast result. */
export function useCopyToClipboard() {
  const { toast } = useToast();
  return useCallback(
    async (text: string, label = "Link copied") => {
      try {
        await navigator.clipboard.writeText(text);
        toast(label, "success");
      } catch {
        toast("Couldn't copy to clipboard", "error");
      }
    },
    [toast]
  );
}

/** Helper: register a global "/" hotkey to focus a target input. */
export function useSearchHotkey(targetRef: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      targetRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [targetRef]);
}
