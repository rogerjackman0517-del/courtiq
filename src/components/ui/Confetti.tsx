"use client";

import { useMemo, useState, useEffect } from "react";

const COLORS = ["#D4B560", "#F5F5F7", "#34D399", "#5B8DEF", "#F87171", "#F59E0B"];

export function Confetti({ count = 28, durationMs = 3400 }: { count?: number; durationMs?: number }) {
  const [visible, setVisible] = useState(true);

  // Deterministic per mount so re-renders don't restart pieces
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 80;
      const delay = Math.random() * 600;
      const duration = 2400 + Math.random() * 1600;
      const color = COLORS[i % COLORS.length];
      const rotate = Math.random() * 360;
      return { left, drift, delay, duration, color, rotate };
    });
  }, [count]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            ["--cd" as string]: `${p.duration}ms`,
            ["--cx" as string]: `${p.drift}px`,
            transform: `rotate(${p.rotate}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
