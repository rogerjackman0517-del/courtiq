"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Stable key to remember the last shown value across remounts in the same session. */
  cacheKey?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// In-memory session cache so navigating back to a page doesn't re-animate
// values from 0 every time. Keyed by the optional cacheKey prop.
const SESSION_CACHE = new Map<string, number>();

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  prefix = "",
  suffix = "",
  className,
  cacheKey,
}: Props) {
  // If we've already animated this value in this session, start from it.
  const cached = cacheKey ? SESSION_CACHE.get(cacheKey) : undefined;
  const [display, setDisplay] = useState(cached ?? 0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(cached ?? 0);

  useEffect(() => {
    // Fast-path: same cached value, skip animation entirely.
    if (cacheKey && SESSION_CACHE.get(cacheKey) === value) {
      setDisplay(value);
      return;
    }
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const next = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else if (cacheKey) SESSION_CACHE.set(cacheKey, value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
