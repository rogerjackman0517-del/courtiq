"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, { w: string; text: string }> = {
  sm: { w: "h-8 w-8",   text: "text-[9px]" },
  md: { w: "h-12 w-12", text: "text-xs" },
  lg: { w: "h-20 w-20", text: "text-base" },
  xl: { w: "h-32 w-32", text: "text-2xl" },
};

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export function PlayerAvatar({
  playerId,
  fullName,
  size = "md",
  className,
  source = "nba",
}: {
  playerId: number;
  fullName: string;
  size?: Size;
  className?: string;
  source?: "nba" | "espn";
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { w, text } = SIZES[size];

  if (failed || !playerId) {
    return (
      <div
        className={cn(
          w,
          "shrink-0 rounded-full bg-gradient-to-br from-[#1C1C24] to-[#0A0A0E] border border-white/[0.05] flex items-center justify-center font-[family-name:var(--font-barlow)] font-black text-[#6E6E76]",
          text,
          className
        )}
      >
        {initials(fullName)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        w,
        "shrink-0 relative rounded-full overflow-hidden bg-gradient-to-b from-[#1C1C24] to-[#0A0A0E] border border-white/[0.05]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={source === "espn" ? `https://a.espncdn.com/i/headshots/nba/players/full/${playerId}.png` : `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`}
        alt={fullName}
        className={cn("w-full h-full object-cover object-top", loaded ? "avatar-morph" : "opacity-0")}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
      {/* Radial vignette to blend photo edges into the dark theme */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle at center, transparent 55%, rgba(10,10,14,0.4) 90%, rgba(10,10,14,0.7) 100%)",
        }}
      />
    </div>
  );
}
