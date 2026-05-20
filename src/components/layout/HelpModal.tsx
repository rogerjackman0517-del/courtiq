"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["/"], label: "Focus search input on /players" },
  { keys: ["?"], label: "Open this help modal" },
  { keys: ["Esc"], label: "Close modal / overlay" },
  { keys: ["↑", "↓"], label: "Navigate command palette results" },
  { keys: ["↵"], label: "Open highlighted result" },
];

export function HelpModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[85] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm premium-fade-in"
    >
      <div
        className="floating-card no-jiggle rounded-3xl bg-[#0F0F16] max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
            Keyboard shortcuts
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[#6E6E76] hover:text-[#F5F5F7]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        <ul className="space-y-3">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-[#F5F5F7]">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="text-[10px] tracking-wider text-[#F5F5F7] border border-white/[0.12] bg-white/[0.03] rounded px-1.5 py-0.5"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
