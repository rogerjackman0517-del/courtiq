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
  /** Only start counting once the element scrolls into view. */
  startOnView?: boolean;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const SESSION_CACHE = new Map<string, number>();

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  prefix = "",
  suffix = "",
  className,
  cacheKey,
  startOnView = false,
}: Props) {
  const cached = cacheKey ? SESSION_CACHE.get(cacheKey) : undefined;
  const [display, setDisplay] = useState(cached ?? 0);
  const [visible, setVisible] = useState(!startOnView);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(cached ?? 0);
  const spanRef = useRef<HTMLSpanElement>(null);

  // IntersectionObserver — only used when startOnView is true
  useEffect(() => {
    if (!startOnView) return;
    const el = spanRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!visible) return;
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
  }, [value, duration, visible]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
