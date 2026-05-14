"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "courtiq-splash-seen";

export function Splash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    setShow(true);
    sessionStorage.setItem(SEEN_KEY, "1");
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0E]">
      <div className="splash-ball relative">
        <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true">
          <circle cx="40" cy="40" r="34" fill="#D4B560" />
          <path
            d="M6 40 H74 M40 6 V74 M14 16 Q40 40 14 64 M66 16 Q40 40 66 64"
            stroke="#0A0A0E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <p className="mt-6 text-center font-[family-name:var(--font-barlow)] font-bold tracking-[-0.04em] text-2xl text-[#F5F5F7]">
          Court<span className="text-[#D4B560]">IQ</span>
        </p>
      </div>
    </div>
  );
}
