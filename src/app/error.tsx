"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log to console; Sentry would hook in here too.
    console.error("[CourtIQ error boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 lg:px-12 py-16 relative">
      <div className="absolute inset-0 court-grid-bg opacity-30 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-xl text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#F87171] mb-4">
          Off the rim
        </p>
        <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-[#F5F5F7] mb-4">
          Something went <span className="text-[#F87171]">wrong.</span>
        </h1>
        <p className="text-base lg:text-lg text-[#8A8A93] mb-8 leading-relaxed">
          We hit a glitch. Try again, or head back to the homepage.
        </p>
        <p className="text-xs text-[#6E6E76] mb-8 font-mono break-words">
          {error.message || "Unknown error"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="ripple inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-white no-jiggle"
          >
            <RotateCcw size={14} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[#8A8A93] hover:text-[#F5F5F7] transition-colors px-4 py-3"
          >
            <Home size={14} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
