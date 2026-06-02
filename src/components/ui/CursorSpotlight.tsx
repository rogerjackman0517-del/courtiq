"use client";

import { useEffect, useRef } from "react";

/**
 * CursorSpotlight — renders a soft gold radial light that follows the cursor
 * across the page. Pointer-events disabled so it never interferes with clicks.
 * Auto-hides on touch devices (where there is no cursor) and respects
 * prefers-reduced-motion. Uses requestAnimationFrame + a tiny lerp so the
 * light glides smoothly behind the mouse rather than snapping.
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices and when the user prefers reduced motion.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    const el = ref.current;
    if (!el) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let visible = false;
    let raf = 0;
    let running = false;

    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      el.style.transform = `translate3d(${cx - 160}px, ${cy - 160}px, 0)`;
      // Stop the loop when the spotlight has effectively caught up.
      // Saves GPU/compositor work when the cursor is idle.
      if (Math.abs(mx - cx) < 0.4 && Math.abs(my - cy) < 0.4) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const ensureRunning = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      ensureRunning();
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[1] h-[320px] w-[320px] rounded-full opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle, rgba(212, 181, 96, 0.05) 0%, rgba(212, 181, 96, 0.02) 35%, transparent 65%)",
        mixBlendMode: "screen",
        willChange: "transform, opacity",
      }}
    />
  );
}
