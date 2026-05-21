"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "courtiq-onboard-seen";

export function OnboardingTooltip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    // Delay so the user has a second to land before we pop up
    const t = setTimeout(() => setShow(true), 2400);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-6 z-[75] max-w-xs rounded-2xl border border-[#D4B560]/30 bg-[#13131C]/95 backdrop-blur-md shadow-2xl p-4 toast-enter hidden md:block"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-2 right-2 text-[#6E6E76] hover:text-[#F5F5F7]"
        aria-label="Dismiss tip"
      >
        <X size={12} />
      </button>
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
        Pro tip
      </p>
      <p className="text-sm text-[#F5F5F7] leading-relaxed mb-2">
        Hit{" "}
        <kbd className="text-[10px] border border-white/[0.15] rounded px-1.5 py-0.5">⌘</kbd>{" "}
        <kbd className="text-[10px] border border-white/[0.15] rounded px-1.5 py-0.5">K</kbd>{" "}
        from anywhere to jump to any player, team, or page.
      </p>
      <p className="text-xs text-[#8A8A93]">
        Or press <kbd className="text-[10px] border border-white/[0.15] rounded px-1.5 py-0.5">?</kbd> for all shortcuts.
      </p>
    </div>
  );
}
