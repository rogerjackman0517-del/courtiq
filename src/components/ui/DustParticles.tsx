"use client";

import { useMemo } from "react";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DustParticles({ seed = 1, count = 16 }: { seed?: number; count?: number }) {
  const dots = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      left: rng() * 100,
      delay: rng() * 6,
      duration: 5 + rng() * 4,
      drift: (rng() - 0.5) * 80,
      size: 2 + Math.floor(rng() * 3),
    }));
  }, [seed, count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="dust"
          style={{
            left: `${d.left}%`,
            bottom: "-4px",
            width: `${d.size}px`,
            height: `${d.size}px`,
            ["--dx" as string]: `${d.drift}px`,
            ["--dd" as string]: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
