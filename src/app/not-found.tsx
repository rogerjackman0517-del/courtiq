import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 lg:px-12 py-16 relative overflow-hidden">
      {/* Bouncing basketball illustration */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-[140%] opacity-95"
        aria-hidden="true"
      >
        <svg viewBox="0 0 80 80" className="h-24 w-24 court-empty-bounce">
          <circle cx="40" cy="40" r="34" fill="#D4B560" />
          <path
            d="M6 40 H74 M40 6 V74 M14 16 Q40 40 14 64 M66 16 Q40 40 66 64"
            stroke="#0A0A0E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Faint court grid backdrop */}
      <div
        className="absolute inset-0 court-grid-bg opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-xl text-center">
        <p className="font-[family-name:var(--font-barlow)] font-black text-[clamp(6rem,18vw,12rem)] leading-none tracking-[-0.04em] mb-6 stat-gradient-text">
          404
        </p>

        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4">
          Off the court
        </p>

        <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-[#F5F5F7] mb-4">
          This page <span className="text-[#D4B560]">doesn&apos;t exist.</span>
        </h1>

        <p className="text-base lg:text-lg text-[#8A8A93] mb-10 max-w-md mx-auto leading-relaxed">
          Looks like you took a shot from beyond the arc and air-balled the URL.
          Let&apos;s get you back in the paint.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="ripple group inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-white transition-all duration-300"
          >
            <Home size={14} />
            Go home
          </Link>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[#8A8A93] hover:text-[#F5F5F7] transition-colors px-4 py-3"
          >
            <Search size={14} />
            Browse players
          </Link>
        </div>
      </div>
    </div>
  );
}
