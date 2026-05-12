"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, { w: string; text: string }> = {
  xs: { w: "h-5 w-5",   text: "text-[8px]" },
  sm: { w: "h-7 w-7",   text: "text-[9px]" },
  md: { w: "h-10 w-10", text: "text-[11px]" },
  lg: { w: "h-16 w-16", text: "text-sm" },
  xl: { w: "h-24 w-24", text: "text-xl" },
};

export function TeamLogo({
  teamId,
  abbreviation,
  primaryColor,
  size = "md",
  className,
}: {
  teamId?: number;
  abbreviation: string;
  primaryColor?: string;
  size?: Size;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const { w, text } = SIZES[size];
  const color = primaryColor ?? "#D4B560";

  if (failed || !teamId) {
    return (
      <div
        className={cn(w, "shrink-0 rounded-lg flex items-center justify-center font-black tracking-tight", text, className)}
        style={{
          backgroundColor: color + "22",
          border: `1px solid ${color}44`,
          color,
        }}
      >
        {abbreviation}
      </div>
    );
  }

  return (
    <div className={cn(w, "shrink-0 rounded-lg overflow-hidden p-1 flex items-center justify-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
        alt={abbreviation}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
